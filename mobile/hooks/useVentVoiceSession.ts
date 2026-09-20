import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  configureVentAudioSession,
  processVentTurn,
  stopVentPlayback,
  subscribeVentSpeaking,
  warmVentSession,
  type VentChatMessage,
} from '../services/elevenLabsVentService';
import {
  saveVentVoiceTone,
  syncVentVoiceToneFromProfile,
} from '../services/ventVoicePreferences';
import type { VentSessionStatus, VoiceToneMode } from '../constants/ventVoice';
import {
  getSpeechRecognitionModule,
  useNoopSpeechEvent,
} from '../utils/speechRecognitionLazy';

type Options = {
  t: (key: string) => string;
};

export function useVentVoiceSession({ t }: Options) {
  const speech = getSpeechRecognitionModule();
  const ExpoSpeechRecognitionModule = speech?.ExpoSpeechRecognitionModule ?? null;
  const useEvent = speech?.useSpeechRecognitionEvent ?? useNoopSpeechEvent;

  const [status, setStatus] = useState<VentSessionStatus>('connecting');
  const [tone, setToneState] = useState<VoiceToneMode>('supportive_listener');
  const [transcript, setTranscript] = useState('');
  const [liveCaption, setLiveCaption] = useState('');
  const [showCaptions, setShowCaptions] = useState(true);
  const [history, setHistory] = useState<VentChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [speechAvailable] = useState(!!ExpoSpeechRecognitionModule);

  const pendingTranscript = useRef('');
  const processingRef = useRef(false);
  const isHoldingRef = useRef(false);
  const historyRef = useRef<VentChatMessage[]>([]);
  const toneRef = useRef<VoiceToneMode>('supportive_listener');

  historyRef.current = history;
  toneRef.current = tone;

  const finishTurn = useCallback(async () => {
    if (processingRef.current) return;

    const userText = pendingTranscript.current.trim();
    if (!userText) {
      setStatus('idle');
      return;
    }

    processingRef.current = true;
    setStatus('thinking');

    try {
      const { reply, updatedHistory } = await processVentTurn(
        toneRef.current,
        historyRef.current,
        userText,
      );
      setHistory(updatedHistory);
      setLiveCaption(reply);
      setTranscript('');
      pendingTranscript.current = '';
    } catch (err) {
      processingRef.current = false;
      setStatus('idle');
      const message = err instanceof Error ? err.message : t('vent.errorGeneric');
      Alert.alert(t('vent.errorTitle'), message);
    }
  }, [t]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await configureVentAudioSession();
        const syncedTone = await syncVentVoiceToneFromProfile();
        if (mounted) setToneState(syncedTone);
        await warmVentSession();
        if (mounted) setStatus('idle');
      } catch (err) {
        console.warn('[useVentVoiceSession] Init failed:', err);
        if (mounted) setStatus('idle');
      }
    })();

    const unsub = subscribeVentSpeaking((speaking) => {
      if (processingRef.current && !speaking) {
        processingRef.current = false;
        setStatus('idle');
        return;
      }
      if (speaking) setStatus('speaking');
    });

    return () => {
      mounted = false;
      unsub();
      if (ExpoSpeechRecognitionModule && isHoldingRef.current) {
        ExpoSpeechRecognitionModule.stop();
      }
      stopVentPlayback().catch(() => {});
    };
  }, [ExpoSpeechRecognitionModule]);

  useEvent('result', (event: any) => {
    const text = event.results?.[0]?.transcript || '';
    if (!text || !isHoldingRef.current) return;
    pendingTranscript.current = text;
    setTranscript(text);
  });

  useEvent('end', () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    void finishTurn();
  });

  useEvent('error', () => {
    isHoldingRef.current = false;
    if (!processingRef.current) setStatus('idle');
  });

  const setTone = useCallback(async (next: VoiceToneMode) => {
    setToneState(next);
    await saveVentVoiceTone(next);
  }, []);

  const startListening = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule || isMuted) return;

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert(t('vent.micTitle'), t('vent.micMessage'));
      return;
    }

    pendingTranscript.current = '';
    setTranscript('');
    isHoldingRef.current = true;
    setStatus('listening');

    await configureVentAudioSession();
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
    });
  }, [ExpoSpeechRecognitionModule, isMuted, t]);

  const stopListening = useCallback(() => {
    if (!ExpoSpeechRecognitionModule || !isHoldingRef.current) return;
    isHoldingRef.current = false;
    ExpoSpeechRecognitionModule.stop();
    void finishTurn();
  }, [ExpoSpeechRecognitionModule, finishTurn]);

  const onMicPressIn = useCallback(() => {
    if (status === 'speaking' || status === 'thinking') {
      void stopVentPlayback();
      processingRef.current = false;
    }
    void startListening();
  }, [startListening, status]);

  const onMicPressOut = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && isHoldingRef.current && ExpoSpeechRecognitionModule) {
        ExpoSpeechRecognitionModule.stop();
        isHoldingRef.current = false;
        setStatus('idle');
      }
      return !prev;
    });
  }, [ExpoSpeechRecognitionModule]);

  const toggleCaptions = useCallback(() => {
    setShowCaptions((v) => !v);
  }, []);

  return {
    status,
    tone,
    setTone,
    transcript,
    liveCaption,
    showCaptions,
    toggleCaptions,
    isMuted,
    toggleMute,
    speechAvailable,
    onMicPressIn,
    onMicPressOut,
    isHolding: status === 'listening',
  };
}
