import React, { useEffect, useRef } from 'react';
import {
  Animated,
  AccessibilityInfo,
  Image,
  ImageSourcePropType,
  StyleProp,
  ImageStyle,
  View,
  StyleSheet,
} from 'react-native';

type Props = {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
};

/** Slow breathing scale + opacity pulse for the Zeno logo mark. */
export default function BreathingLogo({ source, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.03, duration: 2600, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 2600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.97, duration: 2600, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.88, duration: 2600, useNativeDriver: true }),
          ]),
        ]),
      );
      loop.start();
    });

    return () => loop?.stop();
  }, [opacity, scale]);

  return (
    <View style={styles.glowWrap}>
      <Animated.View style={[styles.logoAnim, { transform: [{ scale }], opacity }]}>
        <Image source={source} style={style} resizeMode="cover" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAnim: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 4,
  },
});
