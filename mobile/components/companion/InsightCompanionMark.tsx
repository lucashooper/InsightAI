import React from 'react';
import { View, StyleSheet } from 'react-native';
import AuroraOrb from '../shared/AuroraOrb';
import OrbView from './OrbView';
import { OrbSlot } from './OrbOverlayProvider';
import type { AiPersonality } from '../../utils/aiPersonalities';

const POOLED_SIZES = new Set([36, 40, 48, 110, 130, 220]);

type Props = {
  size?: number;
  isDark?: boolean;
  roast?: boolean;
  personality?: AiPersonality;
  /** @deprecated Orb animates continuously; kept for API compat. */
  speaking?: boolean;
  /** Inline WebView — use inside modals (pool overlay uses screen coordinates). */
  inline?: boolean;
};

/** Mira's avatar — pooled WebGL orb on main screens; inline WebView in modals. */
export default function InsightCompanionMark({
  size = 64,
  isDark = true,
  roast = false,
  personality = 'default',
  inline = false,
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

  if (inline) {
    return (
      <View style={[styles.wrap, { width: size, height: size }]}>
        <OrbView size={size} personality={personality} />
      </View>
    );
  }

  if (POOLED_SIZES.has(size)) {
    return (
      <View style={[styles.wrap, { width: size, height: size }]}>
        <OrbSlot size={size} personality={personality} />
      </View>
    );
  }

  const poolSize = 36;
  const scale = size / poolSize;

  if (size < poolSize) {
    return (
      <View style={[styles.wrap, { width: size, height: size }]}>
        <View style={{ transform: [{ scale }] }}>
          <OrbSlot size={poolSize} personality={personality} />
        </View>
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
