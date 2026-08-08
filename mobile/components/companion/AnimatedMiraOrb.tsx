import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = {
  size?: number;
  source?: ImageSourcePropType;
  showGlow?: boolean;
};

const defaultOrb = require('../../public/Mira-Orb-No-Background.png');

/**
 * Animated Mira orb with ambient glow and slow breathing rotation.
 * Feels alive and reactive without being distracting.
 */
export default function AnimatedMiraOrb({ size = 118, source = defaultOrb, showGlow = true }: Props) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Slow continuous rotation (~90s full circle)
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 90000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    // Gentle breathing scale (~7s breath cycle)
    scale.value = withRepeat(
      withTiming(1.04, {
        duration: 3500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showGlow && <View style={[styles.glow, { width: size * 1.4, height: size * 1.4 }]} />}
      <Animated.View style={[styles.orbWrap, animatedStyle]}>
        <Image
          source={source}
          style={[styles.orbImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'transparent',
    shadowColor: '#a855f7',
    shadowRadius: 80,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  orbWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbImage: {
    width: '100%',
    height: '100%',
  },
});
