import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { PRODUCT_REVEAL_PHONE } from '../../constants/phoneMockups';

const PHONE_WARMUP_WIDTH = 420;
const PHONE_WARMUP_HEIGHT = 900;

/**
 * Full-resolution decode pass for hero images that must never flash on first paint.
 * AppImageWarmup uses 1×1 thumbnails; these need real dimensions in the GPU cache.
 */
export default function OnboardingHeroWarmup() {
  return (
    <View pointerEvents="none" style={styles.host}>
      <Image
        source={PRODUCT_REVEAL_PHONE}
        style={styles.phone}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey="warmup-product-reveal-phone"
        priority="high"
      />
      <Image
        source={INSIGHT_LOGO}
        style={styles.logo}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
        recyclingKey="warmup-insight-logo"
        priority="high"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    left: -9999,
    top: -9999,
  },
  phone: {
    width: PHONE_WARMUP_WIDTH,
    height: PHONE_WARMUP_HEIGHT,
  },
  logo: {
    width: 140,
    height: 140,
  },
});
