import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio, AVPlaybackStatus } from 'expo-av';

export type ElevenLabsVoice = {
  id: string;
  name: string;
  label: string;
  gender: 'female' | 'male';
  style: string;
  /** Voices curated from the ElevenLabs voice library often need a paid plan. */
  tier?: 'free' | 'paid';
};

/** User-curated character voices for Roast / TikTok content. */
export const ELEVENLABS_FEATURED_VOICES: ElevenLabsVoice[] = [
  { id: 'IRHApOXLvnW57QJPQH2P', name: 'Tough Male', label: 'Tough Male', gender: 'male', style: 'Rough, gritty — perfect for roast call-outs', tier: 'paid' },
  { id: 'MKlLqCItoCkvdhrxgtLv', name: 'Old Man', label: 'Old Man', gender: 'male', style: 'Gravelly elder — wise, blunt, no patience', tier: 'paid' },
  { id: 'a5zfmqTslZJBP0jutmVY', name: 'Spoiled Girl', label: 'Spoiled Girl', gender: 'female', style: 'Sassy, petulant, judgmental', tier: 'paid' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', label: 'Bella (free)', gender: 'female', style: 'Soft, sassy female — works on free plan', tier: 'free' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', label: 'Adam (free)', gender: 'male', style: 'Deep male — great roast voice on free plan', tier: 'free' },
];

/** Curated ElevenLabs voices — great for TikTok / Reels content. */
export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  ...ELEVENLABS_FEATURED_VOICES,
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', label: 'Rachel', gender: 'female', style: 'Warm, natural female', tier: 'paid' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', label: 'Domi', gender: 'female', style: 'Strong, confident female', tier: 'paid' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', label: 'Elli', gender: 'female', style: 'Young, expressive female', tier: 'paid' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', label: 'Josh', gender: 'male', style: 'Deep, narrative male', tier: 'paid' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', label: 'Arnold', gender: 'male', style: 'Crisp, authoritative male', tier: 'free' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', label: 'Charlie', gender: 'male', style: 'Casual, conversational male', tier: 'free' },
];

const LOG_PREFIX = '[ElevenLabs]';
const TTS_MODEL = 'eleven_flash_v2_5';
const OUTPUT_FORMAT = 'mp3_44100_128';

export class ElevenLabsApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ElevenLabsApiError';
    this.status = status;
    this.code = code;
  }

  get isPaymentRequired(): boolean {
    return this.status === 402 || this.code === 'paid_plan_required';
  }

  get isPermissionDenied(): boolean {
    return this.status === 401 || this.code === 'unauthorized';
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return '***';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function log(message: string, extra?: Record<string, unknown>): void {
  if (extra) {
    console.log(LOG_PREFIX, message, extra);
  } else {
    console.log(LOG_PREFIX, message);
  }
}

function logError(message: string, error?: unknown, extra?: Record<string, unknown>): void {
  console.error(LOG_PREFIX, message, {
    ...extra,
    error: error instanceof Error ? { name: error.name, message: error.message } : error,
  });
}

let cachedApiKey: string | null | undefined;
let loggedApiKeyOnce = false;

function getApiKey(): string | null {
  if (cachedApiKey !== undefined) return cachedApiKey;

  const fromExtra = Constants.expoConfig?.extra?.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  const fromEnv = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  const key = fromExtra || fromEnv;
  cachedApiKey = key && key.length > 10 ? key : null;

  if (!loggedApiKeyOnce) {
    loggedApiKeyOnce = true;
    if (cachedApiKey) {
      log('API key ready', {
        source: fromExtra ? 'extra' : 'env',
        keyPreview: maskKey(cachedApiKey),
      });
    } else {
      log('No API key configured');
    }
  }

  return cachedApiKey;
}

export function isElevenLabsAvailable(): boolean {
  return !!getApiKey();
}

export function getElevenLabsDebugInfo(): {
  available: boolean;
  keySource: 'extra' | 'env' | 'none';
  keyPreview: string | null;
} {
  const fromExtra = Constants.expoConfig?.extra?.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  const fromEnv = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  const key = getApiKey();
  return {
    available: !!key,
    keySource: fromExtra ? 'extra' : fromEnv ? 'env' : 'none',
    keyPreview: key ? maskKey(key) : null,
  };
}

let currentSound: Audio.Sound | null = null;

export async function stopElevenLabsPlayback(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (error) {
      logError('Failed to stop playback', error);
    }
    currentSound = null;
  }
}

async function parseErrorResponse(response: Response): Promise<ElevenLabsApiError> {
  const status = response.status;
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    bodyText = '';
  }

  let message = `HTTP ${status}`;
  let code: string | undefined;

  try {
    const json = JSON.parse(bodyText);
    const detail = json?.detail;
    if (typeof detail === 'string') {
      message = detail;
    } else if (detail?.message) {
      message = detail.message;
      code = detail.code;
    }
  } catch {
    if (bodyText) message = bodyText.slice(0, 300);
  }

  logError('TTS request failed', undefined, { status, code, message });
  return new ElevenLabsApiError(status, message, code);
}

function encodeBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    result += chars[a >> 2];
    result += chars[((a & 3) << 4) | (b >> 4)];
    result += i + 1 < bytes.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
    result += i + 2 < bytes.length ? chars[c & 63] : '=';
  }
  return result;
}

async function synthesizeToUri(text: string, voiceId: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ElevenLabsApiError(0, 'ElevenLabs API key not configured in app');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`;
  log('Synthesizing speech', {
    voiceId,
    model: TTS_MODEL,
    outputFormat: OUTPUT_FORMAT,
    charCount: text.length,
    endpoint: url,
  });

  const started = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: TTS_MODEL,
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.8,
        style: 0.45,
        use_speaker_boost: true,
      },
    }),
  });

  log('TTS response received', {
    status: response.status,
    ok: response.ok,
    latencyMs: Date.now() - started,
    contentType: response.headers.get('content-type'),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength < 256) {
    throw new ElevenLabsApiError(0, `Audio response too small (${arrayBuffer.byteLength} bytes)`);
  }

  log('Audio received', { bytes: arrayBuffer.byteLength });

  const base64 = encodeBase64(arrayBuffer);

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new ElevenLabsApiError(0, 'FileSystem cache directory unavailable');
  }

  const uri = `${cacheDir}mira-elevenlabs-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileInfo = await FileSystem.getInfoAsync(uri);
  log('Audio cached to disk', { uri, exists: fileInfo.exists, size: fileInfo.size });

  if (!fileInfo.exists || !fileInfo.size) {
    throw new ElevenLabsApiError(0, 'Failed to write audio file to cache');
  }

  return uri;
}

export async function fetchElevenLabsAudioUri(text: string, voiceId: string): Promise<string> {
  return synthesizeToUri(text, voiceId);
}

export async function createAndPlayElevenLabsSound(
  uri: string,
  onStatus?: (status: AVPlaybackStatus) => void,
): Promise<{ sound: Audio.Sound; durationMs: number }> {
  await stopElevenLabsPlayback();

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false, volume: 1.0 });
  currentSound = sound;

  let durationMs = 3000;
  const initial = await sound.getStatusAsync();
  if (initial.isLoaded) {
    durationMs = initial.durationMillis ?? durationMs;
  } else if ('error' in initial) {
    logError('Sound failed to load', initial.error);
    throw new ElevenLabsApiError(0, `Audio failed to load: ${initial.error}`);
  }

  sound.setOnPlaybackStatusUpdate((status) => {
    onStatus?.(status);
    if (!status.isLoaded) return;

    if (status.error) {
      logError('Playback error', status.error);
    }

    if (status.didJustFinish) {
      sound.unloadAsync().catch((error) => logError('Unload after finish failed', error));
      if (currentSound === sound) currentSound = null;
    }
  });

  await sound.playAsync();

  const playing = await sound.getStatusAsync();
  if (playing.isLoaded) {
    log('Playing audio', { durationMs, isPlaying: playing.isPlaying });
  }

  return { sound, durationMs };
}

export async function speakWithElevenLabs(text: string, voiceId: string): Promise<void> {
  const uri = await synthesizeToUri(text, voiceId);
  await createAndPlayElevenLabsSound(uri);
}

/** Verifies TTS works — only needs Text to Speech permission, not models_read. */
export async function verifyElevenLabsConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, message: 'No API key found' };
  }

  const probeVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam — free-tier default voice
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${probeVoiceId}?output_format=${OUTPUT_FORMAT}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text: '.', model_id: TTS_MODEL }),
    });

    if (response.ok) {
      log('TTS permission verified');
      return { ok: true, message: 'Text-to-Speech ready' };
    }

    const err = await parseErrorResponse(response);
    if (err.isPermissionDenied) {
      return {
        ok: false,
        message: 'Enable Text to Speech on your ElevenLabs API key (models_read is not required).',
      };
    }
    return { ok: false, message: err.message };
  } catch (error) {
    logError('TTS permission check failed', error);
    return { ok: false, message: error instanceof Error ? error.message : 'Network error' };
  }
}
