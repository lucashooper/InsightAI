import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ONBOARDING_GRADIENT } from '../../constants/onboardingTheme';

export const ONBOARDING_BG = ONBOARDING_GRADIENT[0];

/** Figma-style -4% tracking for onboarding headings */
export function onboardingHeadingTracking(fontSize: number): number {
  return fontSize * -0.04;
}

/** Soft light onboarding gradient — lavender / peach / sky. */
export default function OnboardingAmbientBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[...ONBOARDING_GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
});
