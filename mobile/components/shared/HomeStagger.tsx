import React, { useEffect, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  /** When false, holds at hidden state until true, then animates once. */
  active?: boolean;
};

const ENTER_MS = 480;
const ENTER_EASING = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Home entrance — a light slide/scale. Opacity stays at 1 so a dropped
 * UI-thread animation can never blank a whole section (the previous fade-from-0
 * + offscreen compositing made home content randomly vanish).
 */
export default function HomeStagger({
  children,
  delay = 0,
  style,
  active = true,
}: Props) {
  const hasAnimated = useRef(false);
  const translateY = useSharedValue(10);
  const scale = useSharedValue(0.985);

  useEffect(() => {
    if (!active || hasAnimated.current) return;
    hasAnimated.current = true;

    const config = { duration: ENTER_MS, easing: ENTER_EASING };
    translateY.value = withDelay(delay, withTiming(0, config));
    scale.value = withDelay(delay, withTiming(1, config));

    const safety = setTimeout(() => {
      translateY.value = 0;
      scale.value = 1;
    }, delay + ENTER_MS + 250);

    return () => clearTimeout(safety);
  }, [active, delay, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} collapsable={false}>
      {children}
    </Animated.View>
  );
}
