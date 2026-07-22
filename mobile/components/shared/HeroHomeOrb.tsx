import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import AuroraOrb from './AuroraOrb';

type Props = {
  size: number;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Soft aurora home hero — no hard circular clip or ring. */
export default function HeroHomeOrb({ size, isDark = true, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <AuroraOrb size={size} isDark={isDark} animate />
    </View>
  );
}
