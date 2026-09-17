import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Blob = {
  /** Centre as a fraction of width / height. */
  cx: number;
  cy: number;
  /** Radius as a fraction of the shorter side. */
  r: number;
  color: string;
  opacity?: number;
};

type Props = {
  /** Base vertical gradient, top → bottom. */
  base?: readonly [string, string, ...string[]];
  blobs?: Blob[];
  /** Slow drift of the blobs. Off under Reduce Motion. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/** Cyan / blue / mint — the loading atmosphere. */
export const MESH_LOADING: { base: Props['base']; blobs: Blob[] } = {
  base: ['#8BEBC6', '#A9E4E0', '#B9D9FF'],
  blobs: [
    { cx: 0.2, cy: 0.18, r: 0.75, color: '#6FE3B0', opacity: 0.85 },
    { cx: 0.85, cy: 0.3, r: 0.7, color: '#9FEFD9', opacity: 0.8 },
    { cx: 0.3, cy: 0.78, r: 0.8, color: '#9CC9FF', opacity: 0.9 },
    { cx: 0.9, cy: 0.9, r: 0.65, color: '#C7E1FF', opacity: 0.9 },
  ],
};

const AnimatedView = Animated.View;

/**
 * A soft mesh gradient built from a base gradient and a few enormous, fully
 * feathered radial blobs. No hard edges anywhere; blobs drift very slowly so
 * the surface feels alive without drawing attention.
 */
export default function MeshGradientBackdrop({
  base = MESH_LOADING.base,
  blobs = MESH_LOADING.blobs,
  animated = true,
  style,
  children,
}: Props) {
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (!animated || reduceMotion) {
      drift.value = 0;
      return;
    }
    drift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(drift);
  }, [animated, reduceMotion, drift]);

  const layerA = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift.value * 26 },
      { translateY: drift.value * -18 },
      { scale: 1 + drift.value * 0.05 },
    ],
  }));
  const layerB = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift.value * -22 },
      { translateY: drift.value * 24 },
      { scale: 1.02 - drift.value * 0.04 },
    ],
  }));

  const uid = React.useMemo(() => Math.random().toString(36).slice(2, 7), []);
  const half = Math.ceil(blobs.length / 2);

  const renderLayer = (items: Blob[], keyPrefix: string) => (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
      <Defs>
        {items.map((b, i) => (
          <RadialGradient key={`${keyPrefix}-g-${i}`} id={`${uid}-${keyPrefix}-${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity ?? 0.9} />
            <Stop offset="0.55" stopColor={b.color} stopOpacity={(b.opacity ?? 0.9) * 0.45} />
            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {items.map((b, i) => (
        <Circle key={`${keyPrefix}-c-${i}`} cx={b.cx * 100} cy={b.cy * 100} r={b.r * 100} fill={`url(#${uid}-${keyPrefix}-${i})`} />
      ))}
    </Svg>
  );

  return (
    <View style={[styles.root, style]} pointerEvents={children ? 'box-none' : 'none'}>
      <LinearGradient colors={base as [string, string, ...string[]]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <AnimatedView style={[StyleSheet.absoluteFill, layerA]}>{renderLayer(blobs.slice(0, half), 'a')}</AnimatedView>
      <AnimatedView style={[StyleSheet.absoluteFill, layerB]}>{renderLayer(blobs.slice(half), 'b')}</AnimatedView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
});
