import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import CloudMascot from '../companion/CloudMascot';
import { subscribeVentSpeechLevel } from '../../services/elevenLabsVentService';
import type { VentSessionStatus } from '../../constants/ventVoice';

type Props = {
  status: VentSessionStatus;
  size?: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export default function VoiceMascot({ status, size = 200 }: Props) {
  const breathe = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.35);
  const bounce = useSharedValue(1);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.97, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(breathe);
  }, [breathe]);

  useEffect(() => {
    if (status === 'listening') {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.55, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1.05, { duration: 700, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      );
      ringOpacity.value = withRepeat(
        withSequence(withTiming(0.65, { duration: 700 }), withTiming(0.15, { duration: 700 })),
        -1,
        false,
      );
      glow.value = withTiming(0.75, { duration: 300 });
    } else {
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
      ringScale.value = withTiming(1, { duration: 250 });
      ringOpacity.value = withTiming(status === 'speaking' ? 0.5 : 0.2, { duration: 250 });
      glow.value = withTiming(status === 'speaking' ? 0.85 : 0.35, { duration: 250 });
    }
  }, [status, ringScale, ringOpacity, glow]);

  useEffect(() => {
    if (status !== 'speaking') {
      bounce.value = withTiming(1, { duration: 200 });
      return;
    }

    const unsub = subscribeVentSpeechLevel((level) => {
      bounce.value = 1 + level * 0.14;
    });

    return unsub;
  }, [status, bounce]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value * bounce.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const outerRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value * 0.55,
    transform: [{ scale: ringScale.value * 1.18 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1.1 + glow.value * 0.25 }],
  }));

  const ringColor =
    status === 'listening' ? '#34D399' : status === 'speaking' ? '#60A5FA' : 'rgba(167,139,250,0.55)';

  return (
    <View style={[styles.wrap, { width: size * 1.8, height: size * 1.8 }]}>
      <AnimatedView style={[styles.glow, glowStyle]} />
      <AnimatedView style={[styles.ring, outerRingStyle, { borderColor: ringColor }]} />
      <AnimatedView style={[styles.ring, ringStyle, { borderColor: ringColor }]} />
      <AnimatedView style={mascotStyle}>
        <CloudMascot
          size={size}
          expression={status === 'listening' ? 'curious' : 'default'}
          valence={status === 'speaking' ? 0.85 : status === 'listening' ? 0.6 : 0.5}
          tint="iris"
          glow
        />
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    borderRadius: 999,
    backgroundColor: 'rgba(139,92,246,0.22)',
  },
  ring: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: 999,
    borderWidth: 2,
  },
});
