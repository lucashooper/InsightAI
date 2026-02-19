import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function StandardContainer({ children, style }: Props) {
  const { theme } = useTheme();
  
  // Use theme-aware gradient colors
  // Dark and midnight themes use dark gradient, all other themes use white
  const isThemeDark = isDarkTheme(theme.name);
  const gradientColors = isThemeDark
    ? ['rgba(20, 20, 20, 0.82)', 'rgba(12, 12, 12, 0.78)'] as const
    : [theme.colors.cardBackground, theme.colors.cardBackground] as const;
  
  const borderColor = isThemeDark
    ? 'rgba(255, 255, 255, 0.10)'
    : theme.colors.border;
  
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
