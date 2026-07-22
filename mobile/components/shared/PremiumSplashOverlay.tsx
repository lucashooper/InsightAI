import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { APP_NAME } from '../../constants/branding';

const splashBackground = require('../../public/abstract-dark-background.jpg');

const SPLASH_TAGLINE = 'Ancient wisdom. Modern clarity.';

type Props = {
  /** RN Animated opacity wrapper from App.tsx dismiss fade */
  style?: object;
};

export default function PremiumSplashOverlay({ style }: Props) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0.88);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(10);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.06, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    bgOpacity.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 650, easing: Easing.out(Easing.ease) }));
    logoTranslateY.value = withDelay(
      200,
      withTiming(0, { duration: 650, easing: Easing.out(Easing.ease) }),
    );
  }, [bgOpacity, logoOpacity, logoTranslateY, scale]);

  const bgAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: bgOpacity.value,
  }));

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  return (
    <View style={[styles.root, style]}>
      <Animated.Image
        source={splashBackground}
        style={[styles.background, bgAnimStyle]}
        resizeMode="cover"
      />
      <View style={styles.scrim} pointerEvents="none" />
      <Animated.View style={[styles.center, logoAnimStyle]}>
        <Text style={styles.brandName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{SPLASH_TAGLINE}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050508',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
