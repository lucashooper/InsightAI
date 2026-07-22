import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, View, Easing, ViewStyle, StyleProp } from 'react-native';
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

const ROAST_BLOBS: Blob[] = [
  { rgb: '220,38,38', alpha: 0.96, diameter: 1.08, cx: 0.5, cy: 0.5, driftX: 4, driftY: -3, scaleFrom: 0.94, scaleTo: 1.08, duration: 5200 },
  { rgb: '234,88,12', alpha: 0.88, diameter: 0.72, cx: 0.44, cy: 0.4, driftX: 9, driftY: -7, scaleFrom: 0.96, scaleTo: 1.06, duration: 4200 },
  { rgb: '127,29,29', alpha: 0.92, diameter: 0.66, cx: 0.6, cy: 0.52, driftX: -8, driftY: 6, scaleFrom: 1.04, scaleTo: 0.95, duration: 4800 },
  { rgb: '251,146,60', alpha: 0.78, diameter: 0.54, cx: 0.52, cy: 0.64, driftX: 6, driftY: 7, scaleFrom: 0.95, scaleTo: 1.05, duration: 5500 },
  { rgb: '185,28,28', alpha: 0.82, diameter: 0.58, cx: 0.36, cy: 0.58, driftX: -6, driftY: -5, scaleFrom: 1.03, scaleTo: 0.97, duration: 4600 },
];

const LIGHT_BLOBS: Blob[] = [
  { rgb: '178,125,230', alpha: 0.64, diameter: 1.06, cx: 0.5, cy: 0.5, driftX: 3, driftY: -2, scaleFrom: 0.99, scaleTo: 1.02, duration: 15000 },
  { rgb: '168,85,247', alpha: 0.88, diameter: 0.68, cx: 0.44, cy: 0.4, driftX: 7, driftY: -6, scaleFrom: 0.99, scaleTo: 1.04, duration: 10000 },
  { rgb: '255,123,101', alpha: 0.80, diameter: 0.60, cx: 0.6, cy: 0.52, driftX: -7, driftY: 5, scaleFrom: 1.03, scaleTo: 0.98, duration: 12000 },
  { rgb: '255,190,105', alpha: 0.64, diameter: 0.49, cx: 0.53, cy: 0.63, driftX: 5, driftY: 6, scaleFrom: 0.97, scaleTo: 1.02, duration: 13500 },
  { rgb: '89,183,216', alpha: 0.58, diameter: 0.52, cx: 0.38, cy: 0.59, driftX: -5, driftY: -4, scaleFrom: 1.02, scaleTo: 0.99, duration: 11500 },
  { rgb: '167,139,250', alpha: 0.52, diameter: 0.56, cx: 0.63, cy: 0.34, driftX: 4, driftY: -3, scaleFrom: 0.98, scaleTo: 1.03, duration: 12500 },
];

const DARK_BLOBS: Blob[] = [
  { rgb: '81,57,119', alpha: 0.72, diameter: 1.06, cx: 0.5, cy: 0.5, driftX: 3, driftY: -2, scaleFrom: 0.99, scaleTo: 1.02, duration: 15000 },
  { rgb: '139,92,246', alpha: 0.92, diameter: 0.76, cx: 0.42, cy: 0.4, driftX: 12, driftY: -10, scaleFrom: 0.97, scaleTo: 1.07, duration: 10000 },
  { rgb: '240,101,79', alpha: 0.76, diameter: 0.66, cx: 0.61, cy: 0.51, driftX: -12, driftY: 9, scaleFrom: 1.05, scaleTo: 0.96, duration: 12000 },
  { rgb: '45,212,191', alpha: 0.67, diameter: 0.57, cx: 0.52, cy: 0.65, driftX: 9, driftY: 11, scaleFrom: 0.94, scaleTo: 1.04, duration: 13500 },
  { rgb: '99,102,241', alpha: 0.64, diameter: 0.58, cx: 0.37, cy: 0.59, driftX: -9, driftY: -8, scaleFrom: 1.04, scaleTo: 0.97, duration: 11500 },
  { rgb: '129,99,220', alpha: 0.58, diameter: 0.58, cx: 0.64, cy: 0.34, driftX: 6, driftY: -5, scaleFrom: 0.98, scaleTo: 1.04, duration: 12500 },
];

/** Soft base wash — wide enough for greeting text, no hard outer ring. */
const HERO_AMBIENT: Blob = {
  rgb: '81,57,119',
  alpha: 0.42,
  diameter: 0.88,
  cx: 0.5,
  cy: 0.5,
  driftX: 2,
  driftY: -1,
  scaleFrom: 0.99,
  scaleTo: 1.02,
  duration: 15000,
};

const WARM_RGB = new Set(['255,123,101', '255,190,105', '240,101,79']);

function AuroraBlob({
  blob,
  size,
  index,
  motionEnabled,
  vivid = false,
  softEdge = false,
}: {
  blob: Blob;
  size: number;
  index: number;
  motionEnabled: boolean;
  vivid?: boolean;
  softEdge?: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const gradientId = `aurora-${index}-${blob.rgb.replace(/,/g, '-')}`;
  const d = size * blob.diameter;

  useEffect(() => {
    if (!motionEnabled) {
      progress.setValue(0.35);
      return;
    }
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
  }, [blob.duration, motionEnabled, progress]);

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
            <Stop offset="0%" stopColor={`rgb(${blob.rgb})`} stopOpacity={vivid ? Math.min(blob.alpha * 1.15, 1) : blob.alpha} />
            <Stop
              offset={softEdge ? '28%' : vivid ? '32%' : '48%'}
              stopColor={`rgb(${blob.rgb})`}
              stopOpacity={softEdge ? blob.alpha * 0.55 : vivid ? blob.alpha * 0.82 : blob.alpha * 0.58}
            />
            <Stop
              offset={softEdge ? '62%' : vivid ? '58%' : '76%'}
              stopColor={`rgb(${blob.rgb})`}
              stopOpacity={softEdge ? blob.alpha * 0.18 : vivid ? blob.alpha * 0.42 : blob.alpha * 0.18}
            />
            <Stop offset="100%" stopColor={`rgb(${blob.rgb})`} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

function scaleBlobsForSize(
  blobs: Blob[],
  size: number,
  compact: boolean,
  clipToCircle: boolean,
  vivid: boolean,
): Blob[] {
  const scale = compact ? Math.min(1, size / 100) : 1;
  const driftScale = compact ? Math.max(0.15, scale * 0.45) : 1;
  const diameterScale = compact && size < 72 && !vivid ? 0.94 : 1;

  return blobs
    .filter((blob) => !(compact && clipToCircle && blob.diameter >= 1.0 && !vivid))
    .map((blob) => {
      const warm = WARM_RGB.has(blob.rgb);
      const warmDim = compact && clipToCircle && warm && !vivid ? 0.55 : 1;
      const coolBoost = compact && clipToCircle && !warm ? (vivid ? 1.22 : 1.08) : 1;

      return {
        ...blob,
        diameter: blob.diameter * diameterScale,
        driftX: blob.driftX * driftScale,
        driftY: blob.driftY * driftScale,
        alpha: compact
          ? Math.min(blob.alpha * warmDim * coolBoost, vivid ? blob.alpha * 1.05 : warm ? blob.alpha * 0.72 : blob.alpha * 0.95)
          : blob.alpha,
      };
    });
}

function buildHeroBlobs(sourceBlobs: Blob[], size: number): Blob[] {
  const scaled = scaleBlobsForSize(sourceBlobs, size, false, false, false)
    .filter((blob) => blob.diameter < 1.0)
    .map((blob) => {
      const sizeBoost = blob.diameter >= 0.7 ? 1.14 : blob.diameter >= 0.55 ? 1.02 : 0.94;
      return {
        ...blob,
        diameter: blob.diameter * sizeBoost,
        alpha: blob.alpha * 0.93,
        driftX: blob.driftX * 0.78,
        driftY: blob.driftY * 0.78,
      };
    });

  return [HERO_AMBIENT, ...scaled];
}

type Props = {
  size: number;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Hard circular mask — use for small companion avatars, not the home hero orb. */
  clipToCircle?: boolean;
  /** Tighter blobs and reduced drift for icon-sized renders (≤ ~72px). */
  compact?: boolean;
  /** Sharper, more saturated compact renders for companion avatar. */
  vivid?: boolean;
  /** Fiery roast-mode palette with faster pulse. */
  variant?: 'default' | 'roast';
  /** When false, blobs stay static (e.g. voice overlay driven by external audio level). */
  animate?: boolean;
  /** Home hero: soft ambient + layered color without a hard outer ring. */
  hero?: boolean;
};

/**
 * Layered multi-source glow orb — several overlapping soft radial gradients that
 * slowly drift and breathe, evoking a calm, ethereal light field.
 */
export default function AuroraOrb({
  size,
  isDark = true,
  style,
  clipToCircle = false,
  compact = false,
  vivid = false,
  variant = 'default',
  animate = true,
  hero = false,
}: Props) {
  const isCompact = compact || size <= 72;
  const sourceBlobs = variant === 'roast' ? ROAST_BLOBS : isDark ? DARK_BLOBS : LIGHT_BLOBS;
  const blobs = hero
    ? buildHeroBlobs(sourceBlobs, size)
    : scaleBlobsForSize(sourceBlobs, size, isCompact, !!clipToCircle, vivid || variant === 'roast');
  const [motionEnabled, setMotionEnabled] = React.useState(true);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => setMotionEnabled(!reduced));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
      setMotionEnabled(!reduced);
    });
    return () => subscription.remove();
  }, []);

  const allowMotion = animate && motionEnabled && !(isCompact && size < 40);

  const content = (
    <>
      {blobs.map((blob, i) => (
        <AuroraBlob
          key={i}
          blob={blob}
          size={size}
          index={i}
          motionEnabled={allowMotion}
          vivid={vivid}
          softEdge={hero && i === 0}
        />
      ))}
    </>
  );

  const boxStyle: ViewStyle = {
    width: size,
    height: size,
    overflow: 'visible',
    ...(clipToCircle ? { borderRadius: size / 2, overflow: 'hidden' as const } : null),
  };

  return (
    <View style={[style, boxStyle]} pointerEvents="none">
      {content}
    </View>
  );
}
