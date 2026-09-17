import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import MeshGradientBackdrop from '../ui/MeshGradientBackdrop';
import { SPLASH_LOADING_WORDMARK } from '../../constants/appAssets';
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
        <Image
          source={SPLASH_LOADING_WORDMARK}
          style={styles.wordmark}
          tintColor={INK.primary}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          accessibilityLabel="Insight"
        />
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
    width: 168,
    height: 48,
  },
});
