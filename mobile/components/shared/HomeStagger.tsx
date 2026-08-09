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

const ENTER_MS = 600;
const ENTER_EASING = Easing.bezier(0.16, 1, 0.3, 1);

/** One-shot home entrance — slide, scale, fade with stagger delay. */
export default function HomeStagger({
  children,
  delay = 0,
  style,
  active = true,
}: Props) {
  const hasAnimated = useRef(false);
  const opacity = useSharedValue(active ? 0 : 0);
  const translateY = useSharedValue(-16);
  const scale = useSharedValue(0.98);

  useEffect(() => {
    if (!active || hasAnimated.current) return;
    hasAnimated.current = true;

    const config = { duration: ENTER_MS, easing: ENTER_EASING };
    opacity.value = withDelay(delay, withTiming(1, config));
    translateY.value = withDelay(delay, withTiming(0, config));
    scale.value = withDelay(delay, withTiming(1, config));
  }, [active, delay, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} needsOffscreenAlphaCompositing>
      {children}
    </Animated.View>
  );
}
