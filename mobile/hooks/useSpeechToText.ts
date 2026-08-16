import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated } from 'react-native';

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: ((event: string, handler: (ev: any) => void) => void) | null = null;

try {
  const speechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch {
  // Expo Go / unsupported build
}

function useNoopSpeechEvent(_event: string, _handler: (ev: any) => void) {}

type Options = {
  locale?: string;
  onTranscript: (text: string) => void;
  getBaseText?: () => string;
  t: (key: string) => string;
};

export function useSpeechToText({ locale = 'en-US', onTranscript, getBaseText, t }: Options) {
  const [isRecording, setIsRecording] = useState(false);
  const baseRef = useRef('');
  const waveAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const useEvent = useSpeechRecognitionEvent ?? useNoopSpeechEvent;

  const pulseWave = useCallback(() => {
    const animations = waveAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 40),
        Animated.timing(anim, { toValue: 0.6 + Math.random() * 0.4, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 250, useNativeDriver: true }),
      ]),
    );
    Animated.parallel(animations).start();
  }, [waveAnims]);

  const stopWave = useCallback(() => {
    waveAnims.forEach((a) => a.setValue(0.3));
  }, [waveAnims]);

  useEvent('result', (event: any) => {
    const transcript = event.results[0]?.transcript || '';
    const isFinal = event.isFinal ?? event.results[0]?.isFinal ?? true;
    if (!transcript) return;
    pulseWave();
    if (isFinal) {
      const base = baseRef.current;
      const next = base ? `${base} ${transcript}` : transcript;
      baseRef.current = next;
      onTranscript(next);
    } else {
      const base = baseRef.current;
      onTranscript(base ? `${base} ${transcript}` : transcript);
    }
  });

  useEvent('end', () => {
    setIsRecording(false);
    stopWave();
  });

  useEvent('error', (event: any) => {
    setIsRecording(false);
    stopWave();
    if (event.error === 'not-allowed') {
      Alert.alert(t('editor.microphoneTitle'), t('editor.microphoneMessage'));
    }
  });

  const toggleRecording = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert(t('editor.voiceTitle'), t('editor.voiceExpo'));
      return;
    }

    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      stopWave();
      return;
    }

    baseRef.current = getBaseText?.() ?? '';
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(t('editor.microphoneTitle'), t('editor.microphoneMessage'));
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: locale,
      interimResults: true,
      continuous: true,
    });
    setIsRecording(true);
  }, [getBaseText, isRecording, locale, stopWave, t]);

  useEffect(() => () => {
    if (isRecording && ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
  }, [isRecording]);

  return { isRecording, toggleRecording, waveAnims, speechAvailable: !!ExpoSpeechRecognitionModule };
}
