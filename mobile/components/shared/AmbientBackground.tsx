import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Dimensions,
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { PREMIUM } from '../../constants/premiumUI';

const GRADIENT_MESH = require('../../public/gradient-ellipse.png');
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Props = {
  style?: StyleProp<ViewStyle>;
  intensity?: 'default' | 'subtle' | 'rich';
};

/**
 * Purple mesh on the right + true golden-orange radial bloom (bottom-right).
 * Radial SVG avoids pink stack-up from reusing the purple mesh, and has no hard edges.
 */
function AmbientBackground({ style, intensity = 'default' }: Props) {
  const opacity =
    intensity === 'rich' ? 0.50 : intensity === 'subtle' ? 0.32 : 0.40;

  const goldPeak =
    intensity === 'rich' ? 0.42 : intensity === 'subtle' ? 0.26 : 0.34;

  return (
    <View pointerEvents="none" style={[styles.root, style]}>
      <View style={[styles.base, { backgroundColor: PREMIUM.bg }]} />

      {/* Purple / magenta mesh — right side */}
      <Image
        source={GRADIENT_MESH}
        style={[styles.meshPrimary, { opacity }]}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* Soft left counterbalance */}
      <Image
        source={GRADIENT_MESH}
        style={[styles.meshLeft, { opacity: opacity * 0.3 }]}
        resizeMode="cover"
        fadeDuration={0}
      />

      {/* True golden-orange bloom — not a pink mesh retint */}
      <Svg
        width={SCREEN_W}
        height={SCREEN_H}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient
            id="zenoGoldBloom"
            cx="92%"
            cy="88%"
            rx="58%"
            ry="48%"
            fx="94%"
            fy="92%"
          >
            <Stop offset="0%" stopColor="#FFC056" stopOpacity={goldPeak} />
            <Stop offset="28%" stopColor="#FF9A3C" stopOpacity={goldPeak * 0.72} />
            <Stop offset="55%" stopColor="#F97316" stopOpacity={goldPeak * 0.32} />
            <Stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </RadialGradient>
          {/* Soft amber lift a bit higher so it meets the purple naturally */}
          <RadialGradient
            id="zenoAmberLift"
            cx="88%"
            cy="72%"
            rx="42%"
            ry="38%"
            fx="90%"
            fy="75%"
          >
            <Stop offset="0%" stopColor="#FBBF24" stopOpacity={goldPeak * 0.28} />
            <Stop offset="45%" stopColor="#F59E0B" stopOpacity={goldPeak * 0.12} />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#zenoGoldBloom)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#zenoAmberLift)" />
      </Svg>
    </View>
  );
}

export default React.memo(AmbientBackground);

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PREMIUM.bg,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  meshPrimary: {
    position: 'absolute',
    width: SCREEN_W * 2.4,
    height: SCREEN_H * 2.0,
    top: -SCREEN_H * 0.35,
    right: -SCREEN_W * 0.55,
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
