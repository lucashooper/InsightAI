import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeInDown, useReducedMotion } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  /** Delay before the entrance begins (ms). */
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Staggered entrance — a soft fade + 14pt rise, used for lists of cards when a
 * screen mounts (Home → Journey, Journey units, onboarding stacks).
 * Honours Reduce Motion by rendering statically.
 */
export default function StaggerIn({ children, delay = 0, duration = 420, style }: Props) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <View style={style}>{children}</View>;

  return (
    <Animated.View
      style={style}
      entering={FadeInDown.delay(delay).duration(duration).easing(EASE).withInitialValues({
        opacity: 0,
        transform: [{ translateY: 14 }],
      })}
    >
      {children}
    </Animated.View>
  );
}

/** Helper for building delays: index → ms with a gentle cap. */
export function staggerDelay(index: number, step = 55, base = 40, max = 480): number {
  return Math.min(max, base + index * step);
}
