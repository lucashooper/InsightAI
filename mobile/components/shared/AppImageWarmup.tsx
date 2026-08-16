import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ALL_PRELOAD_IMAGES } from '../../constants/appAssets';

/**
 * Off-screen decode pass — keeps every bundled raster in the GPU/memory cache
 * so first navigation to onboarding screens never flashes empty.
 */
export default function AppImageWarmup() {
  return (
    <View pointerEvents="none" style={styles.host}>
      {ALL_PRELOAD_IMAGES.map((source, index) => (
        <Image
          key={`warmup-${index}`}
          source={source}
          style={styles.pixel}
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey={`warmup-${index}`}
        />
      ))}
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
  pixel: {
    width: 1,
    height: 1,
  },
});
