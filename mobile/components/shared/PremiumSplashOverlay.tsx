import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const splashBackground = require('../../public/abstract-dark-background.jpg');
const insightLoadingText = require('../../public/Insight-Loading-Text-White-Version.png');

type Props = {
  /** RN Animated opacity wrapper from App.tsx dismiss fade */
  style?: object;
};

/**
 * Premium loading mark — tight, understated wordmark (Tolan-like scale).
 * No tagline; hierarchy lives in the mark alone.
 */
export default function PremiumSplashOverlay({ style }: Props) {
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(8);

  useEffect(() => {
    logoOpacity.value = withDelay(160, withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) }));
    logoTranslateY.value = withDelay(
      160,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) }),
    );
  }, [logoOpacity, logoTranslateY]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  return (
    <View style={[styles.root, style]}>
      <Image source={splashBackground} style={styles.background} resizeMode="cover" />
      <View style={styles.scrim} pointerEvents="none" />
      <Animated.View style={[styles.center, logoAnimStyle]}>
        <Image
          source={insightLoadingText}
          style={styles.wordmark}
          resizeMode="contain"
          accessibilityLabel="Insight"
        />
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
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  /** Sleek, modest scale — premium negative space around the mark */
  wordmark: {
    width: 168,
    height: 48,
  },
});
