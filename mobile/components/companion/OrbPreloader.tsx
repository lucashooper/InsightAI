import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CHAT_PERSONALITIES } from '../../utils/aiPersonalities';
import OrbWarmup from './OrbWarmup';

const COMMON_SIZES = [36, 40, 44, 48, 110, 130, 180, 220, 260] as const;

/** App-root orb pre-mount — warms WebGL for every size/personality combo used in the app. */
export default function OrbPreloader() {
  return (
    <View style={styles.host} pointerEvents="none">
      {COMMON_SIZES.map((size) => (
        <OrbWarmup key={`default-${size}`} size={size} personality="default" />
      ))}
      <OrbWarmup size={40} personality="balanced" />
      {CHAT_PERSONALITIES.map((personality) => (
        <OrbWarmup key={`personality-${personality}`} size={48} personality={personality} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: -10000,
    left: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});
