import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiPersonality } from '../utils/aiPersonalities';
import {
  ELEVENLABS_VOICES,
  ElevenLabsApiError,
  getElevenLabsDebugInfo,
  isElevenLabsAvailable,
  speakWithElevenLabs,
  stopElevenLabsPlayback,
  fetchElevenLabsAudioUri,
  createAndPlayElevenLabsSound,
} from './elevenLabsVoiceService';

const LOG_PREFIX = '[MiraVoice]';

function log(message: string, extra?: Record<string, unknown>): void {
  if (extra) console.log(LOG_PREFIX, message, extra);
  else console.log(LOG_PREFIX, message);
}

function logError(message: string, error?: unknown, extra?: Record<string, unknown>): void {
  console.error(LOG_PREFIX, message, {
    ...extra,
    error: error instanceof Error ? { name: error.name, message: error.message } : error,
  });
}

export const MIRA_VOICE_KEY = 'MIRA_VOICE_SELECTION';

export type MiraVoiceSource = 'device' | 'elevenlabs';

export type MiraVoiceSelection = {
  source: MiraVoiceSource;
  id: string;
  label: string;
};

export type DeviceVoiceOption = {
  source: 'device';
  id: string;
  label: string;
  gender: 'female' | 'male' | 'neutral';
  language: string;
};

type VoiceProfile = {
  pitch: number;
  rate: number;
  voiceHints: string[];
};

const VOICE_PROFILES: Record<AiPersonality, VoiceProfile> = {
  balanced: { pitch: 1.0, rate: 0.92, voiceHints: ['samantha', 'google', 'enhanced'] },
  cheerful: { pitch: 1.15, rate: 1.06, voiceHints: ['karen', 'samantha', 'allison'] },
  direct: { pitch: 0.95, rate: 1.05, voiceHints: ['daniel', 'alex', 'aaron'] },
  playful: { pitch: 1.1, rate: 1.02, voiceHints: ['samantha', 'karen', 'ava'] },
  gentle: { pitch: 1.05, rate: 0.84, voiceHints: ['samantha', 'karen', 'victoria'] },
  hype: { pitch: 1.18, rate: 1.1, voiceHints: ['karen', 'samantha', 'nicky'] },
  roast: { pitch: 0.82, rate: 1.06, voiceHints: ['adam', 'daniel', 'fred', 'aaron'] },
};

/** Curated device voice presets — maps to best available match on the phone. */
export const DEVICE_VOICE_PRESETS: Array<{ id: string; label: string; gender: 'female' | 'male'; hints: string[] }> = [
  { id: 'preset-female-warm', label: 'Female — Warm (Samantha)', gender: 'female', hints: ['samantha', 'karen'] },
  { id: 'preset-female-soft', label: 'Female — Soft (Victoria)', gender: 'female', hints: ['victoria', 'allison', 'ava'] },
  { id: 'preset-female-bold', label: 'Female — Bold (Nicky)', gender: 'female', hints: ['nicky', 'kate', 'zoe'] },
  { id: 'preset-male-deep', label: 'Male — Deep (Daniel)', gender: 'male', hints: ['daniel', 'aaron', 'james'] },
  { id: 'preset-male-casual', label: 'Male — Casual (Alex)', gender: 'male', hints: ['alex', 'tom', 'lee'] },
  { id: 'preset-roast-comic', label: 'Roast — Comic (Fred)', gender: 'male', hints: ['fred', 'comic', 'junior'] },
];

let cachedVoices: Speech.Voice[] | null = null;
let speaking = false;
const speakingListeners = new Set<(active: boolean) => void>();
const speechLevelListeners = new Set<(level: number) => void>();

let smoothedSpeechLevel = 0;
let lastLevelSampleMs = 0;
let lastLevelPositionMs = 0;
let deviceLevelInterval: ReturnType<typeof setInterval> | null = null;

function emitSpeechLevel(raw: number): void {
  const clamped = Math.min(1, Math.max(0, raw));
  smoothedSpeechLevel = smoothedSpeechLevel * 0.72 + clamped * 0.28;
  speechLevelListeners.forEach((listener) => listener(smoothedSpeechLevel));
}

function samplePlaybackLevel(positionMs: number): void {
  const now = Date.now();
  if (lastLevelSampleMs === 0) {
    lastLevelSampleMs = now;
    lastLevelPositionMs = positionMs;
    return;
  }
  const dt = Math.max(16, now - lastLevelSampleMs);
  const velocity = Math.abs(positionMs - lastLevelPositionMs) / dt;
  lastLevelSampleMs = now;
  lastLevelPositionMs = positionMs;
  const base = Math.min(1, velocity * 0.42);
  const noise = Math.sin(now * 0.011) * 0.08 + Math.sin(now * 0.019) * 0.06;
  emitSpeechLevel(0.22 + base * 0.65 + noise);
}

function startDeviceSpeechLevelSimulation(): void {
  if (deviceLevelInterval) return;
  deviceLevelInterval = setInterval(() => {
    if (!speaking) return;
    const t = Date.now() * 0.001;
    const organic =
      0.35
      + Math.sin(t * 6.1) * 0.15
      + Math.sin(t * 11.3) * 0.1
      + Math.sin(t * 17.7) * 0.08;
    emitSpeechLevel(organic);
  }, 50);
}

function stopDeviceSpeechLevelSimulation(): void {
  if (deviceLevelInterval) {
    clearInterval(deviceLevelInterval);
    deviceLevelInterval = null;
  }
}

function resetSpeechLevel(): void {
  lastLevelSampleMs = 0;
  lastLevelPositionMs = 0;
  smoothedSpeechLevel = 0;
  stopDeviceSpeechLevelSimulation();
  speechLevelListeners.forEach((listener) => listener(0));
}

function setSpeaking(active: boolean): void {
  if (speaking === active) return;
  speaking = active;
  if (!active) {
    resetSpeechLevel();
  }
  speakingListeners.forEach((listener) => listener(active));
}

export function subscribeMiraSpeaking(listener: (active: boolean) => void): () => void {
  speakingListeners.add(listener);
  listener(speaking);
  return () => {
    speakingListeners.delete(listener);
  };
}

export function subscribeMiraSpeechLevel(listener: (level: number) => void): () => void {
  speechLevelListeners.add(listener);
  listener(smoothedSpeechLevel);
  return () => {
    speechLevelListeners.delete(listener);
  };
}

export function getMiraSpeechLevel(): number {
  return smoothedSpeechLevel;
}
let cachedSelection: MiraVoiceSelection | null = null;

/** Human conversational pace — ~145 wpm. */
export function estimateSpeechDurationMs(text: string): number {
  const cleaned = text.replace(/\*\*/g, '').replace(/[_#]/g, '').trim();
  const words = cleaned.split(/\s+/).filter(Boolean).length;
  return Math.max(2200, Math.round((words / 145) * 60 * 1000));
}

export type MiraSpeechSyncHandle = {
  stop: () => Promise<void>;
  /** 0–1 progress for syncing visible text to speech. */
  getProgress: () => number;
};

export type MiraSpeechSyncResult = {
  handle: MiraSpeechSyncHandle | null;
  error?: string;
  paymentRequired?: boolean;
  fellBackToDevice?: boolean;
  voiceLabel?: string;
};

let syncPlaybackPositionMs = 0;
let syncPlaybackDurationMs = 0;
let syncSpeechStartMs = 0;

async function getVoices(): Promise<Speech.Voice[]> {
  if (cachedVoices) return cachedVoices;
  try {
    cachedVoices = await Speech.getAvailableVoicesAsync();
  } catch {
    cachedVoices = [];
  }
  return cachedVoices;
}

function inferGender(name: string): 'female' | 'male' | 'neutral' {
  const n = name.toLowerCase();
  if (['samantha', 'karen', 'victoria', 'allison', 'ava', 'nicky', 'kate', 'zoe', 'susan', 'moira', 'tessa', 'fiona'].some((h) => n.includes(h))) {
    return 'female';
  }
  if (['daniel', 'alex', 'fred', 'aaron', 'tom', 'james', 'arthur', 'gordon', 'rishi'].some((h) => n.includes(h))) {
    return 'male';
  }
  return 'neutral';
}

function pickVoice(voices: Speech.Voice[], hints: string[]): string | undefined {
  const english = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));
  const pool = english.length ? english : voices;
  for (const hint of hints) {
    const match = pool.find((v) => v.name?.toLowerCase().includes(hint));
    if (match?.identifier) return match.identifier;
  }
  return pool[0]?.identifier;
}

function resolvePresetVoiceId(presetId: string, voices: Speech.Voice[]): string | undefined {
  const preset = DEVICE_VOICE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return presetId.startsWith('device:') ? presetId.slice(7) : undefined;
  return pickVoice(voices, preset.hints);
}

function cleanSpeechText(text: string): string {
  return text.replace(/\*\*/g, '').replace(/[_#]/g, '').trim();
}

export async function getDeviceVoiceOptions(): Promise<DeviceVoiceOption[]> {
  const voices = await getVoices();
  const english = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));

  const presets = DEVICE_VOICE_PRESETS.map((preset) => ({
    source: 'device' as const,
    id: preset.id,
    label: preset.label,
    gender: preset.gender,
    language: 'en',
  }));

  const raw = english.slice(0, 12).map((v) => ({
    source: 'device' as const,
    id: `device:${v.identifier}`,
    label: v.name || 'Voice',
    gender: inferGender(v.name || ''),
    language: v.language || 'en',
  }));

  return [...presets, ...raw];
}

export async function loadMiraVoiceSelection(): Promise<MiraVoiceSelection | null> {
  if (cachedSelection) return cachedSelection;
  try {
    const raw = await AsyncStorage.getItem(MIRA_VOICE_KEY);
    if (!raw) return null;
    cachedSelection = JSON.parse(raw) as MiraVoiceSelection;
    return cachedSelection;
  } catch {
    return null;
  }
}

export async function saveMiraVoiceSelection(selection: MiraVoiceSelection): Promise<void> {
  cachedSelection = selection;
  await AsyncStorage.setItem(MIRA_VOICE_KEY, JSON.stringify(selection));
}

/**
 * ChatGPT-style sync: start speech immediately and expose playback progress
 * so the UI can reveal text in lockstep with audio.
 */
export async function startMiraSpeechSync(
  text: string,
  personality: AiPersonality,
): Promise<MiraSpeechSyncResult> {
  const cleaned = cleanSpeechText(text);
  if (!cleaned) {
    log('Skipping speech — empty text after cleanup');
    return { handle: null };
  }

  await stopMiraVoice();
  syncSpeechStartMs = Date.now();
  syncPlaybackPositionMs = 0;
  syncPlaybackDurationMs = estimateSpeechDurationMs(cleaned);

  const selection = await loadMiraVoiceSelection();
  log('Starting synced speech', {
    personality,
    selection: selection ? { source: selection.source, id: selection.id, label: selection.label } : null,
    elevenLabs: getElevenLabsDebugInfo(),
    charCount: cleaned.length,
  });

  if (selection?.source === 'elevenlabs' && isElevenLabsAvailable()) {
    setSpeaking(true);
    let paymentRequired = false;
    let syncError: string | undefined;
    try {
      log('Using ElevenLabs voice', { voiceId: selection.id, label: selection.label });
      const uri = await fetchElevenLabsAudioUri(cleaned, selection.id);
      const { durationMs } = await createAndPlayElevenLabsSound(uri, (status) => {
        if (!status.isLoaded) return;
        syncPlaybackPositionMs = status.positionMillis ?? 0;
        if (status.durationMillis) syncPlaybackDurationMs = status.durationMillis;
        if (status.isPlaying) {
          samplePlaybackLevel(status.positionMillis ?? 0);
        }
        if (status.didJustFinish) {
          setSpeaking(false);
          syncPlaybackPositionMs = syncPlaybackDurationMs;
          log('ElevenLabs playback complete');
        }
      });
      syncPlaybackDurationMs = durationMs;
      log('ElevenLabs sync ready', { durationMs });

      return {
        handle: {
          stop: stopMiraVoice,
          getProgress: () => {
            if (syncPlaybackDurationMs > 0) {
              return Math.min(1, syncPlaybackPositionMs / syncPlaybackDurationMs);
            }
            return Math.min(1, (Date.now() - syncSpeechStartMs) / syncPlaybackDurationMs);
          },
        },
        voiceLabel: selection.label,
      };
    } catch (e) {
      paymentRequired = e instanceof ElevenLabsApiError && e.isPaymentRequired;
      syncError = e instanceof Error ? e.message : 'ElevenLabs failed';
      logError('ElevenLabs sync failed', e, { paymentRequired, voiceId: selection.id });
      setSpeaking(false);
      await stopElevenLabsPlayback();

      if (paymentRequired) {
        log('Paid voice blocked — falling back to device TTS', { voice: selection.label });
      }

      // fall through to device with error metadata
      const profile = VOICE_PROFILES[personality] || VOICE_PROFILES.balanced;
      const voices = await getVoices();
      const voiceId = pickVoice(voices, profile.voiceHints);

      log('Using device TTS fallback', { voiceId: voiceId ?? 'default', personality });
      setSpeaking(true);
      startDeviceSpeechLevelSimulation();
      Speech.speak(cleaned, {
        voice: voiceId,
        pitch: profile.pitch,
        rate: profile.rate,
        onDone: () => {
          setSpeaking(false);
          syncPlaybackPositionMs = syncPlaybackDurationMs;
          log('Device TTS complete');
        },
        onStopped: () => {
          setSpeaking(false);
          log('Device TTS stopped');
        },
        onError: (error) => {
          setSpeaking(false);
          logError('Device TTS error', error);
        },
      });

      return {
        handle: {
          stop: stopMiraVoice,
          getProgress: () => Math.min(1, (Date.now() - syncSpeechStartMs) / syncPlaybackDurationMs),
        },
        fellBackToDevice: true,
        paymentRequired,
        error: paymentRequired
          ? `${selection.label} requires a paid ElevenLabs plan (Creator+). Try Bella or Adam for free.`
          : syncError,
        voiceLabel: selection.label,
      };
    }
  } else if (selection?.source === 'elevenlabs') {
    logError('ElevenLabs selected but API key unavailable');
  }

  const profile = VOICE_PROFILES[personality] || VOICE_PROFILES.balanced;
  const voices = await getVoices();

  let voiceId: string | undefined;
  if (selection?.source === 'device') {
    voiceId = resolvePresetVoiceId(selection.id, voices) || (selection.id.startsWith('device:') ? selection.id.slice(7) : undefined);
  }
  if (!voiceId) {
    voiceId = pickVoice(voices, profile.voiceHints);
  }

  log('Using device TTS fallback', { voiceId: voiceId ?? 'default', personality });
  setSpeaking(true);
  startDeviceSpeechLevelSimulation();
  Speech.speak(cleaned, {
    voice: voiceId,
    pitch: profile.pitch,
    rate: profile.rate,
    onDone: () => {
      setSpeaking(false);
      syncPlaybackPositionMs = syncPlaybackDurationMs;
      log('Device TTS complete');
    },
    onStopped: () => {
      setSpeaking(false);
      log('Device TTS stopped');
    },
    onError: (error) => {
      setSpeaking(false);
      logError('Device TTS error', error);
    },
  });

  return {
    handle: {
      stop: stopMiraVoice,
      getProgress: () => Math.min(1, (Date.now() - syncSpeechStartMs) / syncPlaybackDurationMs),
    },
    voiceLabel: selection?.label,
  };
}

export async function speakAsMira(text: string, personality: AiPersonality): Promise<void> {
  const cleaned = cleanSpeechText(text);
  if (!cleaned) return;

  await stopMiraVoice();

  const selection = await loadMiraVoiceSelection();

  if (selection?.source === 'elevenlabs' && isElevenLabsAvailable()) {
    setSpeaking(true);
    try {
      log('Replay via ElevenLabs', { voiceId: selection.id, label: selection.label });
      await speakWithElevenLabs(cleaned, selection.id);
      log('ElevenLabs replay complete');
    } catch (e) {
      logError('ElevenLabs replay failed', e);
      throw e;
    } finally {
      setSpeaking(false);
    }
    return;
  }

  const profile = VOICE_PROFILES[personality] || VOICE_PROFILES.balanced;
  const voices = await getVoices();

  let voiceId: string | undefined;
  if (selection?.source === 'device') {
    voiceId = resolvePresetVoiceId(selection.id, voices) || (selection.id.startsWith('device:') ? selection.id.slice(7) : undefined);
  }
  if (!voiceId) {
    voiceId = pickVoice(voices, profile.voiceHints);
  }

  setSpeaking(true);
  return new Promise((resolve) => {
    Speech.speak(cleaned, {
      voice: voiceId,
      pitch: profile.pitch,
      rate: profile.rate,
      onDone: () => {
        setSpeaking(false);
        resolve();
      },
      onStopped: () => {
        setSpeaking(false);
        resolve();
      },
      onError: () => {
        setSpeaking(false);
        resolve();
      },
    });
  });
}

export async function stopMiraVoice(): Promise<void> {
  Speech.stop();
  await stopElevenLabsPlayback();
  stopDeviceSpeechLevelSimulation();
  setSpeaking(false);
  syncPlaybackPositionMs = 0;
}

export function isMiraSpeaking(): boolean {
  return speaking;
}

export function getElevenLabsVoiceOptions() {
  return ELEVENLABS_VOICES;
}

export { isElevenLabsAvailable, getElevenLabsDebugInfo };
