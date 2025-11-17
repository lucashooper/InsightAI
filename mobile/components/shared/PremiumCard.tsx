import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumCardProps {
  children: React.ReactNode;
  glowColor?: string;
  variant?: 'default' | 'purple' | 'green' | 'amber';
  style?: ViewStyle;
}

export default function PremiumCard({ 
  children, 
  glowColor, 
  variant = 'default',
  style 
}: PremiumCardProps) {
  const getGlowColor = () => {
    if (glowColor) return glowColor;
    switch (variant) {
      case 'purple': return '#8b5cf6';
      case 'green': return '#10b981';
      case 'amber': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  const getBorderColor = () => {
    const color = getGlowColor();
    return `${color}30`; // 30% opacity
  };

  return (
    <View style={[
      styles.container,
      {
        borderColor: getBorderColor(),
        shadowColor: getGlowColor(),
      },
      style
    ]}>
      <LinearGradient
        colors={['rgba(15, 15, 15, 0.95)', 'rgba(26, 26, 26, 0.95)']}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    padding: 20,
  },
});
