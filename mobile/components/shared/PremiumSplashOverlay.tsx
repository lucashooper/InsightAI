import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MeshGradientBackdrop from '../ui/MeshGradientBackdrop';
import { sf } from '../../utils/responsive';
import { INK } from '../../constants/typography';

type Props = {
  /** RN Animated opacity wrapper from App.tsx dismiss fade */
  style?: object;
};

/** Loading screen — a full-bleed pastel mesh gradient with the wordmark in charcoal. */
export default function PremiumSplashOverlay({ style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <MeshGradientBackdrop />
      <View style={styles.center}>
        <Text style={styles.wordmark} accessibilityRole="header">
          Insight
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#A9E4E0',
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  wordmark: {
    fontSize: sf(36),
    fontWeight: '500',
    letterSpacing: sf(36) * 0.03,
    color: INK.primary,
  },
});
