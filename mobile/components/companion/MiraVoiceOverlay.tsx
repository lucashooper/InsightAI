import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuroraOrb from '../shared/AuroraOrb';
import { subscribeMiraSpeechLevel } from '../../services/miraVoiceService';
import { ROAST_GRADIENT, ROAST_PALETTE } from '../../utils/companionTheme';
import { sf } from '../../utils/responsive';

const ORB_SIZE = 220;

type Props = {
  visible: boolean;
  isRoast: boolean;
  isDark: boolean;
  normalGradient: [string, string, ...string[]];
  speakingLabel: string;
  muteLabel: string;
  onMute: () => void;
};

export default function MiraVoiceOverlay({
  visible,
  isRoast,
  isDark,
  normalGradient,
  speakingLabel,
  muteLabel,
  onMute,
}: Props) {
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(1)).current;
  const speechLevelRef = useRef(0);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: visible ? 1 : 0,
      duration: visible ? 380 : 260,
      useNativeDriver: true,
    }).start();
  }, [visible, fade]);

  useEffect(() => subscribeMiraSpeechLevel((level) => {
    speechLevelRef.current = level;
  }), []);

  useEffect(() => {
    if (!visible) {
      orbScale.setValue(1);
      return;
    }

    const tick = setInterval(() => {
      const level = speechLevelRef.current;
      const targetScale = 1 + level * 0.14;
      Animated.timing(orbScale, {
        toValue: targetScale,
        duration: 90,
        useNativeDriver: true,
      }).start();
    }, 40);

    return () => clearInterval(tick);
  }, [visible, orbScale]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.overlay, { opacity: fade }]}
    >
      {isRoast ? (
        <LinearGradient colors={[...ROAST_GRADIENT]} style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient colors={normalGradient} style={StyleSheet.absoluteFill} />
      )}

      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Animated.View
          style={[
            styles.orbWrap,
            isRoast ? styles.orbWrapRoast : styles.orbWrapNormal,
            { transform: [{ scale: orbScale }] },
          ]}
        >
          <AuroraOrb
            size={ORB_SIZE}
            isDark={isDark || isRoast}
            variant={isRoast ? 'roast' : 'default'}
            vivid
            animate={false}
          />
        </Animated.View>

        <Text
          style={[
            styles.speakingLabel,
            isRoast
              ? { color: ROAST_PALETTE.textPrimary }
              : { color: isDark ? '#fff' : '#1e1b4b' },
          ]}
        >
          {speakingLabel}
        </Text>

        <TouchableOpacity
          style={[styles.muteButton, isRoast && styles.muteButtonRoast]}
          onPress={onMute}
          activeOpacity={0.85}
        >
          <Ionicons
            name="volume-mute"
            size={22}
            color={isRoast ? ROAST_PALETTE.textPrimary : '#fff'}
          />
          <Text style={[styles.muteLabel, isRoast && { color: ROAST_PALETTE.textPrimary }]}>
            {muteLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  orbWrap: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    borderRadius: ORB_SIZE / 2,
    overflow: 'visible',
  },
  orbWrapRoast: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 36,
    elevation: 12,
  },
  orbWrapNormal: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 10,
  },
  speakingLabel: {
    fontSize: sf(22),
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 48,
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  muteButtonRoast: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderColor: 'rgba(239,68,68,0.35)',
  },
  muteLabel: {
    color: '#fff',
    fontSize: sf(16),
    fontWeight: '600',
  },
});
