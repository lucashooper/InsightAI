import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { AiPersonality } from '../../utils/aiPersonalities';
import OrbView from './OrbView';

type Props = {
  size?: number;
  personality?: AiPersonality;
};

/** Off-screen orb mount so WebGL is warm before the next screen transition. */
export default function OrbWarmup({ size = 130, personality = 'default' }: Props) {
  return (
    <View style={[styles.host, { width: size, height: size }]} pointerEvents="none">
      <OrbView size={size} personality={personality} warmup />
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
