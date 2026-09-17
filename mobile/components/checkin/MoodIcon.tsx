import React from 'react';
import { View, StyleSheet } from 'react-native';
import CloudMascot, { MOOD_TINT_COLORS, MOOD_VALENCE } from '../companion/CloudMascot';
import { MoodTier } from './types';

type Props = {
  tier: MoodTier;
  size?: number;
};

/**
 * The mood face is the mascot itself: tint and expression follow the tier and
 * animate between states, so the slider feels like it is talking to someone.
 */
export default function MoodIcon({ tier, size = 160 }: Props) {
  const large = size >= 96;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <CloudMascot
        size={size}
        tint={MOOD_TINT_COLORS[tier]}
        valence={MOOD_VALENCE[tier]}
        shadow={large}
        animated={large}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
