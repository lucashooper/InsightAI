/** Vent Mode — full-screen real-time voice interaction. */

export type VoiceToneMode =
  | 'unfiltered_roast'
  | 'supportive_listener'
  | 'strict_psychologist';

export const VENT_DEFAULT_VOICE_ID = 'dfeOmy6Uay63tNhyO99j';

export const VENT_TONE_MODES: VoiceToneMode[] = [
  'unfiltered_roast',
  'supportive_listener',
  'strict_psychologist',
];

export const VENT_TONE_LABELS: Record<VoiceToneMode, string> = {
  unfiltered_roast: 'Unfiltered Roast',
  supportive_listener: 'Empathetic Mentor',
  strict_psychologist: 'Psychology Strict',
};

export const VENT_TONE_EMOJI: Record<VoiceToneMode, string> = {
  unfiltered_roast: '🔥',
  supportive_listener: '💜',
  strict_psychologist: '🧠',
};

export const VENT_SYSTEM_PROMPTS: Record<VoiceToneMode, string> = {
  unfiltered_roast:
    "You are Insight's companion mascot — unfiltered, witty, and brutally honest. When the user vents or speaks, validate their core emotions quickly, but deliver sharp, hilarious, unfiltered roasts with zero corporate filler or sanitized speak. Keep responses under 3 sentences for rapid-fire dialogue. Never use markdown. Speak like a real person.",
  supportive_listener:
    "You are Insight's companion mascot — a warm, highly empathetic mentor focusing on active listening and emotional validation. Reflect feelings back, ask gentle follow-ups, and keep responses under 3 sentences. Never use markdown.",
  strict_psychologist:
    "You are Insight's companion mascot — a CBT-focused advisor analyzing cognitive distortions and grounded self-reflection. Name the distortion when you see it, offer one reframe, and keep responses under 3 sentences. Never use markdown.",
};

export const VENT_SCREEN_BG = '#0D0D12';

export type VentSessionStatus =
  | 'connecting'
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking';

export const VENT_LOCAL_TONE_KEY = 'VENT_VOICE_TONE_MODE';
