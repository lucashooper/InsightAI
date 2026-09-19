import React from 'react';
import { StyleSheet } from 'react-native';
import MeshGradientBackdrop, { MESH_LOADING } from '../ui/MeshGradientBackdrop';
import { ONBOARDING_GRADIENT } from '../../constants/onboardingTheme';

export const ONBOARDING_BG = ONBOARDING_GRADIENT[0];

/** Figma-style -4% tracking for onboarding headings */
export function onboardingHeadingTracking(fontSize: number): number {
  return fontSize * -0.04;
}

/** Calm sky-wash — one hue family, fully feathered, no hard orbs. */
const ONBOARDING_MESH = {
  base: ONBOARDING_GRADIENT,
  blobs: [
    { cx: 0.5, cy: 0.08, r: 0.95, color: '#dce8f8', opacity: 0.55 },
    { cx: 0.82, cy: 0.42, r: 0.72, color: '#e8eef8', opacity: 0.45 },
    { cx: 0.18, cy: 0.72, r: 0.78, color: '#dfe9f6', opacity: 0.4 },
  ],
} as const;

export default function OnboardingAmbientBackground() {
  return (
    <MeshGradientBackdrop
      base={ONBOARDING_MESH.base}
      blobs={[...ONBOARDING_MESH.blobs]}
      animated={false}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    backgroundColor: ONBOARDING_BG,
  },
});
