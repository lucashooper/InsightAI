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
  const speakBoost = useSharedValue(1);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(breathe);
  }, [breathe]);

  useEffect(() => {
    if (status !== 'speaking') {
      speakBoost.value = withTiming(1, { duration: 250 });
      return;
    }

    const unsub = subscribeVentSpeechLevel((level) => {
      speakBoost.value = 1 + level * 0.05;
    });

    return unsub;
  }, [status, speakBoost]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value * speakBoost.value }],
  }));

  return (
    <View style={[styles.wrap, { width: size * 1.15, height: size * 1.15 }]}>
      <AnimatedView style={mascotStyle}>
        <CloudMascot
          size={size}
          expression={status === 'listening' ? 'curious' : 'default'}
          valence={status === 'speaking' ? 0.85 : status === 'listening' ? 0.6 : 0.5}
          tint="iris"
          glow={false}
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
});
