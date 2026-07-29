import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PREMIUM } from '../../constants/premiumUI';
import { sf } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

export const DASHBOARD_HEADER_HEIGHT = 88;

type Props = {
  title: string;
};

/** Large Heading — shared by Dashboard + Journal */
export default function DashboardHeaderHero({ title }: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.ease) });
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Text style={[styles.title, { color: dark ? PREMIUM.text.primary : '#1a1a1a' }]}>
        {title}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingTop: PREMIUM.space[1],
    paddingBottom: PREMIUM.space[1],
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: sf(32),
    fontWeight: '700' as const,
    letterSpacing: -0.7,
    lineHeight: sf(38),
  },
});
