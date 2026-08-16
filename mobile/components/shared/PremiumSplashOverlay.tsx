import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SPLASH_BACKGROUND, SPLASH_LOADING_WORDMARK } from '../../constants/appAssets';

type Props = {
  /** RN Animated opacity wrapper from App.tsx dismiss fade */
  style?: object;
};

/** Premium loading screen — dedicated splash background image (not the in-app home gradient). */
export default function PremiumSplashOverlay({ style }: Props) {
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(8);
  const bgScale = useSharedValue(1);
  const bgOpacity = useSharedValue(0.88);

  useEffect(() => {
    logoOpacity.value = withDelay(160, withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) }));
    logoTranslateY.value = withDelay(
      160,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) }),
    );
    bgScale.value = withRepeat(
      withTiming(1.06, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    bgOpacity.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [bgOpacity, bgScale, logoOpacity, logoTranslateY]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const bgAnimStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scale: bgScale.value }],
  }));

  return (
    <View style={[styles.root, style]}>
      <Animated.View style={[styles.backgroundWrap, bgAnimStyle]}>
        <Image
          source={SPLASH_BACKGROUND}
          style={styles.background}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey="splash-background"
        />
      </Animated.View>
      <View style={styles.scrim} pointerEvents="none" />
      <Animated.View style={[styles.center, logoAnimStyle]}>
        <Image
          source={SPLASH_LOADING_WORDMARK}
          style={styles.wordmark}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          accessibilityLabel="Insight"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0B18',
    overflow: 'hidden',
  },
  backgroundWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.32)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  wordmark: {
    width: 168,
    height: 48,
  },
});
