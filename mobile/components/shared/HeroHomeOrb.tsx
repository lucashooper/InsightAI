import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import AuroraOrb from './AuroraOrb';

type Props = {
  size: number;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Soft aurora home hero — tight glow, no ring or hard container edge. */
export default function HeroHomeOrb({ size, isDark = true, style }: Props) {
  return (
    <View style={[{ width: size, height: size, overflow: 'visible' }, style]} pointerEvents="none">
      <AuroraOrb size={size} isDark={isDark} animate hero />
    </View>
  );
}
