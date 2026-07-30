import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Dimensions,
} from 'react-native';
import { PREMIUM } from '../../constants/premiumUI';

const GRADIENT_MESH = require('../../public/gradient-ellipse-noise.png');
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Props = {
  style?: StyleProp<ViewStyle>;
  intensity?: 'default' | 'subtle' | 'rich';
};

/**
 * Soft ambient mesh (prefetched at app launch).
 * No runtime blurRadius — that caused a progressive “fade in” decode.
 * The PNG already carries blur + grain.
 */
function AmbientBackground({ style, intensity = 'default' }: Props) {
  const opacity =
    intensity === 'rich' ? 0.88 : intensity === 'subtle' ? 0.58 : 0.72;

  return (
    <View pointerEvents="none" style={[styles.root, style]}>
      <View style={[styles.base, { backgroundColor: PREMIUM.bg }]} />

      <Image
        source={GRADIENT_MESH}
        style={[styles.meshPrimary, { opacity }]}
        resizeMode="cover"
        fadeDuration={0}
      />

      <Image
        source={GRADIENT_MESH}
        style={[styles.meshSoft, { opacity: opacity * 0.4 }]}
        resizeMode="cover"
        fadeDuration={0}
      />
    </View>
  );
}

export default React.memo(AmbientBackground);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PREMIUM.bg,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  meshPrimary: {
    position: 'absolute',
    width: SCREEN_W * 1.75,
    height: SCREEN_H * 1.45,
    right: -SCREEN_W * 0.22,
    bottom: -SCREEN_H * 0.12,
  },
  meshSoft: {
    position: 'absolute',
    width: SCREEN_W * 1.9,
    height: SCREEN_H * 1.2,
    left: -SCREEN_W * 0.28,
    bottom: -SCREEN_H * 0.18,
  },
});
