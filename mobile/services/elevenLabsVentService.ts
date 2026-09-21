/**
 * Vent Mode voice session — low-latency TTS via Supabase edge function
 * with optional client-side fallback when EXPO_PUBLIC_ELEVENLABS_API_KEY is set.
 */
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Audio, AVPlaybackStatus, type SoundInstance } from '../utils/audioCompat';
import { fetchWithTimeout, FetchTimeoutError } from '../utils/fetchWithTimeout';
import {
  VENT_DEFAULT_VOICE_ID,
  VENT_FALLBACK_VOICE_ID,
  VENT_SYSTEM_PROMPTS,
  VENT_VOICE_IDS,
  type VoiceToneMode,
} from '../constants/ventVoice';
import {
  fetchElevenLabsAudioUri,
  isElevenLabsAvailable,
  stopElevenLabsPlayback,
} from './elevenLabsVoiceService';
import { GROQ_CHAT_MODEL } from '../constants/groqConfig';

const LOG_PREFIX = '[VentVoice]';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 2;

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
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (err) {
    console.warn('[VentVoice] Audio session setup warning:', err);
  }
}

async function writeBase64ToCache(audioBase64: string): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error('Cache unavailable');

  const uri = `${cacheDir}vent-elevenlabs-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, audioBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

async function synthesizeViaEdge(text: string, voiceId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetchWithTimeout(
    FUNCTION_URL,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId }),
    },
    REQUEST_TIMEOUT_MS,
  );

  const raw = await response.text();
  if (!response.ok) {
    let detail = raw.slice(0, 200);
    try {
      const parsed = JSON.parse(raw);
      detail = parsed.error || parsed.detail || detail;
    } catch {
      // keep slice
    }
    throw new Error(`Vent TTS failed (${response.status}): ${detail}`);
  }

  const data = JSON.parse(raw) as { audioBase64: string; latencyMs?: number };
  if (!data.audioBase64) throw new Error('Vent TTS returned empty audio');

  log('Edge TTS complete', { latencyMs: data.latencyMs, voiceId });
  return writeBase64ToCache(data.audioBase64);
}

async function resolveAudioUriOnce(text: string, voiceId: string): Promise<string> {
  if (FUNCTION_URL) {
    try {
      return await synthesizeViaEdge(text, voiceId);
    } catch (err) {
      log('Edge TTS failed, trying client fallback', {
        voiceId,
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  if (isElevenLabsAvailable()) {
    return fetchElevenLabsAudioUri(text, voiceId);
  }

  throw new Error('Vent voice unavailable');
}

async function resolveAudioUri(text: string, voiceId: string): Promise<string> {
  const voiceCandidates = [voiceId, VENT_FALLBACK_VOICE_ID].filter(
    (id, index, arr) => arr.indexOf(id) === index,
  );

  let lastError: unknown;

  for (const candidate of voiceCandidates) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 900));
        }
        return await resolveAudioUriOnce(text, candidate);
      } catch (err) {
        lastError = err;
        log('TTS attempt failed', {
          attempt: attempt + 1,
          voiceId: candidate,
          error: err instanceof Error ? err.message : err,
        });
      }
    }
  }

  if (lastError instanceof FetchTimeoutError) {
    throw new Error('Voice is briefly unavailable. Try again.');
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error('Voice is briefly unavailable. Try again.');
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

async function playVentSound(uri: string): Promise<SoundInstance> {
  await configureVentAudioSession();

  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false, volume: 1.0 });
  activeSound = sound;

  let prevPos = 0;
  let prevTime = Date.now();

  sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.isPlaying && status.positionMillis != null) {
      samplePlaybackLevel(status.positionMillis, prevPos, prevTime);
      prevPos = status.positionMillis;
      prevTime = Date.now();
    }
    if (status.didJustFinish) {
      setVentSpeaking(false);
      sound.unloadAsync().catch(() => {});
      if (activeSound === sound) activeSound = null;
    }
  });

  const loaded = await sound.getStatusAsync();
  if (!loaded.isLoaded) {
    throw new Error('Voice audio failed to load');
  }

  await sound.playAsync();
  return sound;
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
  tone: VoiceToneMode = 'supportive_listener',
): Promise<void> {
  const cleaned = text.replace(/\*\*/g, '').replace(/[_#]/g, '').trim();
  if (!cleaned) return;

  await stopVentPlayback();

  const voiceId = VENT_VOICE_IDS[tone] || VENT_DEFAULT_VOICE_ID;
  const uri = await resolveAudioUri(cleaned, voiceId);

  setVentSpeaking(true);
  startLevelSimulation();
  await playVentSound(uri);
}

async function callGroqForVentOnce(
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
  const response = await fetchWithTimeout(
    url,
    {
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
    },
    REQUEST_TIMEOUT_MS,
  );

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

async function callGroqForVent(
  tone: VoiceToneMode,
  history: VentChatMessage[],
  userText: string,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 700));
      return await callGroqForVentOnce(tone, history, userText);
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError instanceof FetchTimeoutError) {
    throw new Error('Voice is briefly unavailable. Try again.');
  }
  throw lastError instanceof Error ? lastError : new Error('Voice is briefly unavailable. Try again.');
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

  await speakVentReply(reply, tone);
  return { reply, updatedHistory };
}

export async function warmVentSession(): Promise<void> {
  if (!FUNCTION_URL) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetchWithTimeout(
      FUNCTION_URL,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
        },
      },
      REQUEST_TIMEOUT_MS,
    );
  } catch {
    // non-fatal warm-up
  }
}
