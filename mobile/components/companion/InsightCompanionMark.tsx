import React from 'react';
import { View, StyleSheet } from 'react-native';
import CloudMascot from './CloudMascot';
import type { AiPersonality } from '../../utils/aiPersonalities';

type Props = {
  size?: number;
  /** @deprecated Mascot is light-mode only; kept for API compat. */
  isDark?: boolean;
  roast?: boolean;
  personality?: AiPersonality;
  /** @deprecated Mascot animates continuously; kept for API compat. */
  speaking?: boolean;
  /** @deprecated Cloud mascot renders inline everywhere; kept for API compat. */
  inline?: boolean;
  /** Disable the breathing / blinking loop (e.g. many avatars in a list). */
  animated?: boolean;
};

/** Mira's avatar — the cloud mascot, rendered inline everywhere. */
export default function InsightCompanionMark({
  size = 64,
  roast = false,
  personality = 'default',
  animated,
}: Props) {
  // Tiny avatars (chat bubbles, headers) skip the ground shadow so they sit
  // cleanly in a circle, and skip motion when there may be many on screen.
  const compact = size < 56;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <CloudMascot
        size={size}
        personality={personality}
        isRoast={roast}
        shadow={!compact}
        animated={animated ?? !compact}
      />
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
