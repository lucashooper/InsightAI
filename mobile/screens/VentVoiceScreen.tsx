import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { safeGoBack } from '../utils/navigationSafety';
import VoiceMascot from '../components/voice/VoiceMascot';
import VentTonePicker from '../components/voice/VentTonePicker';
import { useVentVoiceSession } from '../hooks/useVentVoiceSession';
import {
  VENT_SCREEN_BG,
  VENT_TEXT_PRIMARY,
  VENT_TEXT_SECONDARY,
  type VentSessionStatus,
} from '../constants/ventVoice';

function statusDotColor(status: VentSessionStatus): string {
  if (status === 'connecting' || status === 'thinking') return '#9CA3AF';
  if (status === 'listening') return '#34D399';
  if (status === 'speaking') return '#8B5CF6';
  return '#D1D5DB';
}

function statusLabel(status: VentSessionStatus, t: (key: string) => string): string {
  switch (status) {
    case 'connecting':
      return t('vent.statusConnecting');
    case 'listening':
      return t('vent.statusListening');
    case 'thinking':
      return t('vent.statusThinking');
    case 'speaking':
      return t('vent.statusSpeaking');
    default:
      return t('vent.statusIdle');
  }
}

export default function VentVoiceScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const {
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
    errorMessage,
    onMicPressIn,
    onMicPressOut,
    isHolding,
  } = useVentVoiceSession({ t });

  const hint = useMemo(() => {
    if (errorMessage) return errorMessage;
    if (!speechAvailable) return t('vent.expoFallback');
    if (isMuted) return t('vent.muted');
    if (status === 'idle') return t('vent.holdToTalk');
    return statusLabel(status, t);
  }, [errorMessage, isMuted, speechAvailable, status, t]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.glassBtn}
          onPress={() => safeGoBack(navigation)}
          accessibilityLabel={t('vent.close')}
        >
          <Ionicons name="close" size={24} color={VENT_TEXT_PRIMARY} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.statusDot, { backgroundColor: statusDotColor(status) }]} />
          <Text style={styles.statusText}>{statusLabel(status, t)}</Text>
        </View>

        <View style={styles.headerRight}>
          <VentTonePicker tone={tone} onChange={setTone} t={t} />
        </View>
      </View>

      <View style={styles.center}>
        <VoiceMascot status={status} size={210} />
        <Text style={[styles.hint, errorMessage ? styles.hintError : null]}>{hint}</Text>
        {transcript ? (
          <Text style={styles.userTranscript} numberOfLines={3}>
            "{transcript}"
          </Text>
        ) : null}
      </View>

      {showCaptions && liveCaption ? (
        <View style={styles.captionBar}>
          <Text style={styles.captionText}>{liveCaption}</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={toggleCaptions}>
          <View style={styles.glassChip}>
            <Ionicons
              name={showCaptions ? 'text' : 'text-outline'}
              size={20}
              color={VENT_TEXT_PRIMARY}
            />
          </View>
          <Text style={styles.secondaryLabel}>{t('vent.captions')}</Text>
        </TouchableOpacity>

        <Pressable
          style={[
            styles.micBtn,
            isHolding && styles.micBtnActive,
            isMuted && styles.micBtnMuted,
          ]}
          onPressIn={onMicPressIn}
          onPressOut={onMicPressOut}
          onLongPress={toggleMute}
          delayLongPress={500}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : isHolding ? 'mic' : 'mic-outline'}
            size={32}
            color="#fff"
          />
        </Pressable>

        <TouchableOpacity style={styles.secondaryBtn} onPress={toggleMute}>
          <View style={styles.glassChip}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high-outline'}
              size={20}
              color={VENT_TEXT_PRIMARY}
            />
          </View>
          <Text style={styles.secondaryLabel}>{isMuted ? t('vent.unmute') : t('vent.mute')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const glass = {
  backgroundColor: 'rgba(255,255,255,0.82)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.95)',
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: VENT_SCREEN_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  glassBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    ...glass,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerRight: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: VENT_TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hint: {
    marginTop: 28,
    color: VENT_TEXT_SECONDARY,
    fontSize: 15,
    textAlign: 'center',
  },
  hintError: {
    color: 'rgba(26,26,26,0.72)',
  },
  userTranscript: {
    marginTop: 14,
    color: 'rgba(26,26,26,0.65)',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  captionBar: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    ...glass,
  },
  captionText: {
    color: VENT_TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  micBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  micBtnActive: {
    backgroundColor: '#7C3AED',
    transform: [{ scale: 1.04 }],
  },
  micBtnMuted: {
    backgroundColor: '#9CA3AF',
  },
  glassChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...glass,
  },
  secondaryBtn: {
    width: 72,
    alignItems: 'center',
    gap: 6,
  },
  secondaryLabel: {
    color: VENT_TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
  },
});
