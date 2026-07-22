import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { sf } from '../../utils/responsive';

const dashboardHeaderImage = require('../../public/Zeno-Dashboard-background.webp');
const FADE_BG = '#0B0B12';
export const DASHBOARD_HEADER_HEIGHT = 220;

type Props = {
  title: string;
};

export default function DashboardHeaderHero({ title }: Props) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.ease) });
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Image
        source={dashboardHeaderImage}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.tint} pointerEvents="none" />
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'transparent']}
        style={styles.topFade}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', FADE_BG]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
      <View style={styles.titleWrap} pointerEvents="none">
        <Text style={styles.title}>{title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: DASHBOARD_HEADER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: FADE_BG,
  },
  image: {
    width: '100%',
    height: DASHBOARD_HEADER_HEIGHT,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 80,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: DASHBOARD_HEADER_HEIGHT * 0.65,
  },
  titleWrap: {
    position: 'absolute',
    left: 20,
    bottom: 18,
    right: 20,
  },
  title: {
    fontSize: sf(28),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.6,
  },
});
