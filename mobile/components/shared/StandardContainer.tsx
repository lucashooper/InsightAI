import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function StandardContainer({ children, style }: Props) {
  const { theme } = useTheme();
  
  // Use theme-aware gradient colors
  const gradientColors = theme.name === 'light' 
    ? [theme.colors.cardBackground, theme.colors.cardBackground] as const
    : ['rgba(20, 20, 20, 0.82)', 'rgba(12, 12, 12, 0.78)'] as const;
  
  const borderColor = theme.name === 'light'
    ? theme.colors.border
    : 'rgba(255, 255, 255, 0.10)';
  
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
