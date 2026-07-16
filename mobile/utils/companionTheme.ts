import React from 'react';
import { Animated } from 'react-native';

export const ROAST_GRADIENT = ['#121212', '#2C0808', '#3D1308'] as const;

export const ROAST_PALETTE = {
  textPrimary: '#F5F5F5',
  textSecondary: 'rgba(255,255,255,0.65)',
  textCrimson: '#FCA5A5',
  accent: '#EF4444',
  accentGlow: 'rgba(239,68,68,0.45)',
  chipBg: 'rgba(0,0,0,0.55)',
  chipBorder: 'rgba(239,68,68,0.55)',
  bubbleAssistant: 'rgba(220,38,38,0.14)',
  bubbleAssistantBorder: 'rgba(239,68,68,0.35)',
  inputBg: 'rgba(0,0,0,0.45)',
  inputBorder: 'rgba(239,68,68,0.35)',
  sendGradient: ['#DC2626', '#991B1B'] as [string, string],
  icon: '#FCA5A5',
  dot: '#EF4444',
};

export function useRoastTransition(isRoast: boolean) {
  const anim = React.useRef(new Animated.Value(isRoast ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isRoast ? 1 : 0,
      duration: 480,
      useNativeDriver: true,
    }).start();
  }, [isRoast, anim]);

  return {
    anim,
    normalOpacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    roastOpacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
  };
}
