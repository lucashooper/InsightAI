import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SPLASH_BACKGROUND, SPLASH_LOADING_WORDMARK } from '../../constants/appAssets';

type Props = {
  /** RN Animated opacity wrapper from App.tsx dismiss fade */
  style?: object;
};

/** Main loading screen — premium red/purple gradient + Insight wordmark. */
export default function PremiumSplashOverlay({ style }: Props) {
  const bgScale = useSharedValue(1);

  useEffect(() => {
    bgScale.value = withRepeat(
      withTiming(1.04, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [bgScale]);

  const bgAnimStyle = useAnimatedStyle(() => ({
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
      <View style={styles.center}>
        <Image
          source={SPLASH_LOADING_WORDMARK}
          style={styles.wordmark}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          accessibilityLabel="Insight"
        />
      </View>
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
