import React from 'react';
import { View, StyleSheet } from 'react-native';
import AuroraOrb from '../shared/AuroraOrb';
import OrbView from './OrbView';
import type { AiPersonality } from '../../utils/aiPersonalities';

type Props = {
  size?: number;
  isDark?: boolean;
  roast?: boolean;
  personality?: AiPersonality;
  /** @deprecated Orb animates continuously; kept for API compat. */
  speaking?: boolean;
};

/** Mira's avatar — animated WebGL orb; fiery AuroraOrb only in roast mode. */
export default function InsightCompanionMark({
  size = 64,
  isDark = true,
  roast = false,
  personality = 'default',
}: Props) {
  if (roast) {
    return (
      <View style={[styles.wrap, { width: size, height: size }]}>
        <AuroraOrb
          size={size}
          isDark={isDark}
          clipToCircle
          compact
          vivid
          variant="roast"
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <OrbView size={size} personality={personality} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
