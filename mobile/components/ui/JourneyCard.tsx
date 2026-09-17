import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { JOURNEY, JourneyHue, PREMIUM } from '../../constants/premiumUI';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';

type Props = {
  hue: JourneyHue;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Saturated journey unit — used for home quests and playbook protocols. */
export default function JourneyCard({ hue, children, style, contentStyle }: Props) {
  const { theme } = useTheme();
  const dark = isDarkTheme(theme.name);
  const pal = JOURNEY[hue];

  return (
    <LinearGradient
      colors={dark ? pal.dark : pal.light}
      start={{ x: 0.05, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={[styles.card, style]}
    >
      <View pointerEvents="none" style={styles.sheen} />
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: PREMIUM.radius.card,
    overflow: 'hidden',
  },
  sheen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    opacity: 0.35,
  },
  inner: {
    padding: PREMIUM.layout.cardPad,
  },
});
