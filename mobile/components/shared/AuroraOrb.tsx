import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Easing, ViewStyle, StyleProp } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

type Blob = {
  /** rgb triplet, e.g. '168,85,247' */
  rgb: string;
  /** peak alpha at the blob core */
  alpha: number;
  /** blob diameter as a fraction of the orb box */
  diameter: number;
  /** blob center position as fraction of the orb box (0..1) */
  cx: number;
  cy: number;
  /** slow drift distance in px */
  driftX: number;
  driftY: number;
  /** breathe scale range */
  scaleFrom: number;
  scaleTo: number;
  /** animation cycle in ms */
  duration: number;
};

const LIGHT_BLOBS: Blob[] = [
  { rgb: '168,85,247', alpha: 0.5, diameter: 0.95, cx: 0.4, cy: 0.4, driftX: 16, driftY: -14, scaleFrom: 0.95, scaleTo: 1.08, duration: 9000 },
  { rgb: '255,133,102', alpha: 0.42, diameter: 0.8, cx: 0.66, cy: 0.52, driftX: -18, driftY: 12, scaleFrom: 1.06, scaleTo: 0.94, duration: 11000 },
  { rgb: '255,206,138', alpha: 0.36, diameter: 0.72, cx: 0.5, cy: 0.7, driftX: 12, driftY: 16, scaleFrom: 0.92, scaleTo: 1.05, duration: 12500 },
  { rgb: '125,180,255', alpha: 0.3, diameter: 0.66, cx: 0.32, cy: 0.64, driftX: -12, driftY: -10, scaleFrom: 1.04, scaleTo: 0.96, duration: 10500 },
];

const DARK_BLOBS: Blob[] = [
  { rgb: '139,92,246', alpha: 0.78, diameter: 0.98, cx: 0.42, cy: 0.42, driftX: 18, driftY: -16, scaleFrom: 0.94, scaleTo: 1.1, duration: 9000 },
  { rgb: '240,101,79', alpha: 0.6, diameter: 0.82, cx: 0.64, cy: 0.5, driftX: -20, driftY: 14, scaleFrom: 1.08, scaleTo: 0.93, duration: 11000 },
  { rgb: '45,212,191', alpha: 0.5, diameter: 0.72, cx: 0.52, cy: 0.7, driftX: 14, driftY: 18, scaleFrom: 0.9, scaleTo: 1.06, duration: 12500 },
  { rgb: '99,102,241', alpha: 0.52, diameter: 0.68, cx: 0.32, cy: 0.62, driftX: -14, driftY: -12, scaleFrom: 1.05, scaleTo: 0.95, duration: 10500 },
];

function AuroraBlob({ blob, size, index }: { blob: Blob; size: number; index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const gradientId = `aurora-${index}-${blob.rgb.replace(/,/g, '-')}`;
  const d = size * blob.diameter;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: blob.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: blob.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blob.duration]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, blob.driftX] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, blob.driftY] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [blob.scaleFrom, blob.scaleTo] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: d,
        height: d,
        left: size * blob.cx - d / 2,
        top: size * blob.cy - d / 2,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={`rgb(${blob.rgb})`} stopOpacity={blob.alpha} />
            <Stop offset="55%" stopColor={`rgb(${blob.rgb})`} stopOpacity={blob.alpha * 0.45} />
            <Stop offset="100%" stopColor={`rgb(${blob.rgb})`} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

type Props = {
  size: number;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Layered multi-source glow orb — several overlapping soft radial gradients that
 * slowly drift and breathe, evoking a calm, ethereal light field.
 */
export default function AuroraOrb({ size, isDark = true, style }: Props) {
  const blobs = isDark ? DARK_BLOBS : LIGHT_BLOBS;
  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      {blobs.map((blob, i) => (
        <AuroraBlob key={i} blob={blob} size={size} index={i} />
      ))}
    </View>
  );
}
