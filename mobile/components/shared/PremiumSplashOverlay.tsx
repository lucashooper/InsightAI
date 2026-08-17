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
import { SPLASH_PREMIUM } from '../../constants/appAssets';

type Props = {
  /** RN Animated opacity wrapper from App.tsx dismiss fade */
  style?: object;
};

/** Premium loading screen — red/purple textured gradient + Insight wordmark (matches native splash). */
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
          source={SPLASH_PREMIUM}
          style={styles.background}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey="splash-premium"
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
});
