import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
  variant?: 'accent' | 'warm';
};

const GRADIENTS = {
  accent: ['#93C5FD', '#A5B4FC', '#C4B5FD'] as const,
  warm: ['#FDE68A', '#FBBF24', '#F59E0B'] as const,
};

export default function PremiumGradientText({ children, style, variant = 'accent' }: Props) {
  const flat = StyleSheet.flatten(style) || {};
  const fontSize = flat.fontSize ?? 17;
  const fontWeight = flat.fontWeight ?? '600';

  return (
    <MaskedView
      maskElement={
        <Text style={[styles.mask, { fontSize, fontWeight }, style]}>{children}</Text>
      }
    >
      <LinearGradient colors={GRADIENTS[variant] as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={[styles.placeholder, { fontSize, fontWeight }, style]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    backgroundColor: 'transparent',
    color: '#000',
  },
  placeholder: {
    opacity: 0,
  },
});
