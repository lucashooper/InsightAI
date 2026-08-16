import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { ONBOARDING_FOCUS_LOTTIE, ONBOARDING_MEDITATION_LOTTIE } from '../../constants/appAssets';

/** Off-screen warmup so onboarding Lotties are parsed before their slides. */
export default function OnboardingLottieWarmup() {
  return (
    <View pointerEvents="none" style={warmupStyles.host}>
      <LottieView
        source={ONBOARDING_MEDITATION_LOTTIE}
        autoPlay
        loop
        style={warmupStyles.lottie}
      />
      <LottieView
        source={ONBOARDING_FOCUS_LOTTIE}
        autoPlay
        loop
        style={warmupStyles.lottie}
      />
    </View>
  );
}

const warmupStyles = {
  host: {
    position: 'absolute' as const,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden' as const,
  },
  lottie: {
    width: 1,
    height: 1,
  },
};
