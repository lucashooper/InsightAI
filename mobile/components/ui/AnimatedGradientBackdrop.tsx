import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Colors = readonly [string, string, ...string[]];

type Props = {
  colors: Colors;
  /** Crossfade duration when `colors` changes (ms). */
  duration?: number;
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
};

function sameColors(a: Colors, b: Colors): boolean {
  return a.length === b.length && a.every((c, i) => c === b[i]);
}

/**
 * Full-page gradient that crossfades whenever its colours change — the
 * "immersive space" behind Journey, onboarding heroes and detail views.
 * Two layers are kept: the previous gradient underneath, the new one fading in.
 */
export default function AnimatedGradientBackdrop({
  colors,
  duration = 700,
  style,
  start = { x: 0.1, y: 0 },
  end = { x: 0.9, y: 1 },
  children,
}: Props) {
  const [layers, setLayers] = useState<{ base: Colors; top: Colors }>({ base: colors, top: colors });
  const progress = useSharedValue(1);

  useEffect(() => {
    if (sameColors(colors, layers.top)) return;
    setLayers((prev) => ({ base: prev.top, top: colors }));
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors]);

  const topStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View pointerEvents="none" style={[styles.root, style]}>
      <LinearGradient colors={layers.base as [string, string, ...string[]]} start={start} end={end} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, topStyle]}>
        <LinearGradient colors={layers.top as [string, string, ...string[]]} start={start} end={end} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    overflow: 'hidden',
  },
});
