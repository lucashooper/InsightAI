import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
  AccessibilityInfo,
} from 'react-native';
import { sf } from '../../utils/responsive';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PulsingCtaButton({ label, onPress, disabled, loading }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;

    const startPulse = () => {
      loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.02, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 0.65, duration: 900, useNativeDriver: false }),
            Animated.timing(glowAnim, { toValue: 0.35, duration: 900, useNativeDriver: false }),
          ]),
        ]),
      );
      loop.start();
    };

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!reduced && !disabled && !loading) startPulse();
    });

    return () => loop?.stop();
  }, [disabled, loading, pulseAnim, glowAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Animated.View
        style={[
          styles.glow,
          {
            shadowOpacity: glowAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
          activeOpacity={0.9}
          onPress={onPress}
          disabled={disabled || loading}
        >
          <View style={styles.inner}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.label}>{label}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 6,
  },
  button: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  inner: {
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
