import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

type Props = {
  children: React.ReactNode;
  active?: boolean;
  onComplete?: () => void;
};

/** Soft fade-in for assistant text — matches Mira chat pacing. */
export default function AssistantFadeIn({ children, active = true, onComplete }: Props) {
  const opacity = useRef(new Animated.Value(active ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(active ? 8 : 0)).current;

  useEffect(() => {
    if (!active) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(8);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onComplete?.();
    });
  }, [active, onComplete, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
