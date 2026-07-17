import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import AuroraOrb from './AuroraOrb';

type Props = {
  size: number;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ROTATION_MS = 11000;

/** Circular-clipped aurora with a slow inner rotation — no rings or extras. */
export default function HeroHomeOrb({ size, isDark = true, style }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const [motionEnabled, setMotionEnabled] = React.useState(true);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => setMotionEnabled(!reduced));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
      setMotionEnabled(!reduced);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!motionEnabled) {
      spin.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: ROTATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [motionEnabled, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const r = size / 2;

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.clip,
          { width: size, height: size, borderRadius: r, transform: [{ rotate }] },
        ]}
      >
        <AuroraOrb size={size} isDark={isDark} clipToCircle animate />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
