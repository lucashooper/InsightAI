/**
 * Vent Mode voice session — low-latency TTS via Supabase edge function
 * with optional client-side fallback when EXPO_PUBLIC_ELEVENLABS_API_KEY is set.
 */
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Audio, AVPlaybackStatus, type SoundInstance } from '../utils/audioCompat';
import {
  VENT_DEFAULT_VOICE_ID,
  VENT_SYSTEM_PROMPTS,
  type VoiceToneMode,
} from '../constants/ventVoice';
import {
  createAndPlayElevenLabsSound,
  fetchElevenLabsAudioUri,
  isElevenLabsAvailable,
  stopElevenLabsPlayback,
} from './elevenLabsVoiceService';
import { GROQ_CHAT_MODEL } from '../constants/groqConfig';

const LOG_PREFIX = '[VentVoice]';

const supabaseUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const FUNCTION_URL = supabaseUrl ? `${supabaseUrl}/functions/v1/elevenlabs-vent` : '';

export type VentChatMessage = { role: 'user' | 'assistant'; content: string };

let ventSpeaking = false;
const speakingListeners = new Set<(active: boolean) => void>();
const levelListeners = new Set<(level: number) => void>();
let smoothedLevel = 0;
let levelInterval: ReturnType<typeof setInterval> | null = null;
let activeSound: SoundInstance | null = null;

function log(message: string, extra?: Record<string, unknown>): void {
  if (extra) console.log(LOG_PREFIX, message, extra);
  else console.log(LOG_PREFIX, message);
}

function emitLevel(raw: number): void {
  const clamped = Math.min(1, Math.max(0, raw));
  smoothedLevel = smoothedLevel * 0.72 + clamped * 0.28;
  levelListeners.forEach((l) => l(smoothedLevel));
}

function setVentSpeaking(active: boolean): void {
  if (ventSpeaking === active) return;
  ventSpeaking = active;
  if (!active) {
    smoothedLevel = 0;
    if (levelInterval) {
      clearInterval(levelInterval);
      levelInterval = null;
    }
    levelListeners.forEach((l) => l(0));
  }
  speakingListeners.forEach((l) => l(active));
}

export function subscribeVentSpeaking(listener: (active: boolean) => void): () => void {
  speakingListeners.add(listener);
  listener(ventSpeaking);
  return () => speakingListeners.delete(listener);
}

export function subscribeVentSpeechLevel(listener: (level: number) => void): () => void {
  levelListeners.add(listener);
  listener(smoothedLevel);
  return () => levelListeners.delete(listener);
}

export async function configureVentAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

async function synthesizeViaEdge(text: string, voiceId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voiceId }),
  });

  const raw = await response.text();
  if (!response.ok) {
    let detail = raw.slice(0, 200);
    try {
      detail = JSON.parse(raw).error || detail;
    } catch {
      // keep slice
    }
    throw new Error(`Vent TTS failed (${response.status}): ${detail}`);
  }

  const data = JSON.parse(raw) as { audioBase64: string; latencyMs?: number };
  log('Edge TTS complete', { latencyMs: data.latencyMs });

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error('Cache unavailable');

  const uri = `${cacheDir}vent-elevenlabs-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, data.audioBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

async function resolveAudioUri(text: string, voiceId: string): Promise<string> {
  if (FUNCTION_URL) {
    try {
      return await synthesizeViaEdge(text, voiceId);
    } catch (err) {
      log('Edge TTS failed, trying client fallback', { error: err instanceof Error ? err.message : err });
    }
  }

  if (isElevenLabsAvailable()) {
    return fetchElevenLabsAudioUri(text, voiceId);
  }

  throw new Error('Vent voice unavailable — configure ELEVENLABS_API_KEY on Supabase or EXPO_PUBLIC_ELEVENLABS_API_KEY locally.');
}

function startLevelSimulation(): void {
  if (levelInterval) return;
  levelInterval = setInterval(() => {
    if (!ventSpeaking) return;
    const t = Date.now() * 0.001;
    emitLevel(0.35 + Math.sin(t * 6.5) * 0.18 + Math.sin(t * 12.1) * 0.12);
  }, 50);
}

function samplePlaybackLevel(positionMs: number, prevMs: number, prevTime: number): void {
  const now = Date.now();
  const dt = Math.max(16, now - prevTime);
  const velocity = Math.abs(positionMs - prevMs) / dt;
  const base = Math.min(1, velocity * 0.45);
  emitLevel(0.25 + base * 0.6);
}

export async function stopVentPlayback(): Promise<void> {
  setVentSpeaking(false);
  if (activeSound) {
    try {
      await activeSound.stopAsync();
      await activeSound.unloadAsync();
    } catch {
      // ignore
    }
    activeSound = null;
  }
  await stopElevenLabsPlayback();
}

export async function speakVentReply(
  text: string,
  voiceId: string = VENT_DEFAULT_VOICE_ID,
): Promise<void> {
  const cleaned = text.replace(/\*\*/g, '').replace(/[_#]/g, '').trim();
  if (!cleaned) return;

  await stopVentPlayback();
  setVentSpeaking(true);
  startLevelSimulation();

  const uri = await resolveAudioUri(cleaned, voiceId);
  let prevPos = 0;
  let prevTime = Date.now();

  const { sound } = await createAndPlayElevenLabsSound(uri, (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.isPlaying && status.positionMillis != null) {
      samplePlaybackLevel(status.positionMillis, prevPos, prevTime);
      prevPos = status.positionMillis;
      prevTime = Date.now();
    }
    if (status.didJustFinish) {
      setVentSpeaking(false);
    }
  });

  activeSound = sound;
}

async function callGroqForVent(
  tone: VoiceToneMode,
  history: VentChatMessage[],
  userText: string,
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const systemPrompt = `${VENT_SYSTEM_PROMPTS[tone]}\n\nYou are in live voice vent mode — speak naturally, no lists, no markdown.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ];

  const url = `${supabaseUrl}/functions/v1/groq-proxy`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: GROQ_CHAT_MODEL,
      temperature: tone === 'unfiltered_roast' ? 0.95 : 0.75,
      max_tokens: 220,
      reasoning_effort: 'low',
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Vent AI failed (${response.status}): ${raw.slice(0, 200)}`);
  }

  const data = JSON.parse(raw);
  const content =
    data?.choices?.[0]?.message?.content?.trim() ||
    data?.choices?.[0]?.message?.reasoning?.trim?.() ||
    '';

  if (!content) throw new Error('Empty response from vent AI');
  return content;
}

export async function processVentTurn(
  tone: VoiceToneMode,
  history: VentChatMessage[],
  userText: string,
): Promise<{ reply: string; updatedHistory: VentChatMessage[] }> {
  const trimmed = userText.trim();
  if (!trimmed) throw new Error('No speech detected');

  const reply = await callGroqForVent(tone, history, trimmed);
  const updatedHistory: VentChatMessage[] = [
    ...history,
    { role: 'user', content: trimmed },
    { role: 'assistant', content: reply },
  ];

  await speakVentReply(reply);
  return { reply, updatedHistory };
}

export async function warmVentSession(): Promise<void> {
  if (!FUNCTION_URL) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(FUNCTION_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
      },
    });
  } catch {
    // non-fatal warm-up
  }
}
