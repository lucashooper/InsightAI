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

const GRADIENT_MESH = require('../../public/gradient-ellipse.png');
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Props = {
  style?: StyleProp<ViewStyle>;
  intensity?: 'default' | 'subtle' | 'rich';
};

/**
 * Soft oversized mesh wash.
 * No rotation (rotated Image + overflow:hidden = sharp diagonal seams).
 * Meshes are large enough that PNG edges stay off-screen.
 * Primary = purple right; warm = orange-heavy bottom (source PNG has orange at bottom).
 */
function AmbientBackground({ style, intensity = 'default' }: Props) {
  const opacity =
    intensity === 'rich' ? 0.52 : intensity === 'subtle' ? 0.34 : 0.42;

  return (
    <View pointerEvents="none" style={[styles.root, style]}>
      <View style={[styles.base, { backgroundColor: PREMIUM.bg }]} />

      {/* Purple / magenta wash — right side, oversized so edges never clip */}
      <Image
        source={GRADIENT_MESH}
        style={[styles.meshPrimary, { opacity }]}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* Extra purple depth, slightly higher */}
      <Image
        source={GRADIENT_MESH}
        style={[styles.meshPurpleHigh, { opacity: opacity * 0.45 }]}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* Orange / amber bloom — bottom right (PNG orange band sits at bottom) */}
      <Image
        source={GRADIENT_MESH}
        style={[styles.meshOrange, { opacity: opacity * 0.7 }]}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* Soft left fill so the scene never hard-cuts */}
      <Image
        source={GRADIENT_MESH}
        style={[styles.meshLeft, { opacity: opacity * 0.35 }]}
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
    // Do NOT use overflow:'hidden' with rotated/offset meshes — causes sharp seams
    backgroundColor: PREMIUM.bg,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  meshPrimary: {
    position: 'absolute',
    // ~2.4× screen so the soft falloff covers the whole viewport
    width: SCREEN_W * 2.4,
    height: SCREEN_H * 2.0,
    top: -SCREEN_H * 0.35,
    right: -SCREEN_W * 0.55,
  },
  meshPurpleHigh: {
    position: 'absolute',
    width: SCREEN_W * 2.0,
    height: SCREEN_H * 1.6,
    top: -SCREEN_H * 0.45,
    right: -SCREEN_W * 0.4,
  },
  meshOrange: {
    position: 'absolute',
    // Shift so the orange band of the PNG lands in the lower-right
    width: SCREEN_W * 2.2,
    height: SCREEN_H * 1.8,
    bottom: -SCREEN_H * 0.55,
    right: -SCREEN_W * 0.35,
  },
  meshLeft: {
    position: 'absolute',
    width: SCREEN_W * 1.8,
    height: SCREEN_H * 1.5,
    top: SCREEN_H * 0.15,
    left: -SCREEN_W * 0.7,
    transform: [{ scaleX: -1 }],
  },
});
