import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function StandardContainer({ children, style }: Props) {
  const { theme, containerStyle } = useTheme();
  
  const isThemeDark = isDarkTheme(theme.name);
  
  let gradientColors: readonly [string, string];
  let borderColor: string;
  
  if (containerStyle === 'responsive') {
    // Responsive: containers tint toward the theme's accent/surface colors
    gradientColors = isThemeDark
      ? [theme.colors.surfaceElevated, theme.colors.surface] as const
      : [theme.colors.cardBackground, theme.colors.surface] as const;
    borderColor = theme.colors.border;
  } else {
    // Modern Gray: neutral glassmorphic containers (Mindersa-style)
    gradientColors = isThemeDark
      ? ['rgba(32, 32, 38, 0.82)', 'rgba(24, 24, 30, 0.78)'] as const
      : ['rgba(245, 245, 248, 0.85)', 'rgba(240, 240, 244, 0.80)'] as const;
    borderColor = isThemeDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.06)';
  }
  
  return (
    <View style={[styles.container, style, { borderColor }]}>
      <LinearGradient
        colors={gradientColors as any}
        style={styles.gradient}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
  },
});
