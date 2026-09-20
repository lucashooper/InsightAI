/** Lazy-load expo-speech-recognition so native module init is deferred until first use. */

export type SpeechRecognitionBundle = {
  ExpoSpeechRecognitionModule: {
    start: (options: Record<string, unknown>) => void;
    stop: () => void;
    requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  };
  useSpeechRecognitionEvent: (event: string, handler: (ev: unknown) => void) => void;
};

let cached: SpeechRecognitionBundle | null | undefined;

export function getSpeechRecognitionModule(): SpeechRecognitionBundle | null {
  if (cached !== undefined) return cached;
  try {
    const mod = require('expo-speech-recognition');
    cached = {
      ExpoSpeechRecognitionModule: mod.ExpoSpeechRecognitionModule,
      useSpeechRecognitionEvent: mod.useSpeechRecognitionEvent,
    };
  } catch {
    cached = null;
  }
  return cached;
}

export function useNoopSpeechEvent(_event: string, _handler: (ev: unknown) => void): void {}
