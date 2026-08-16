import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import OnboardingButton from './OnboardingButton';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PulsingCtaButton({ label, onPress, disabled, loading }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;

    const startPulse = () => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
      );
      loop.start();
    };

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!reduced && !disabled && !loading) startPulse();
    });

    return () => loop?.stop();
  }, [disabled, loading, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <OnboardingButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        loading={loading}
      />
    </Animated.View>
  );
}
