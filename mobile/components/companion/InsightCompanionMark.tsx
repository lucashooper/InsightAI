import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Image } from 'react-native';
import AuroraOrb from '../shared/AuroraOrb';

const MIRA_ORB = require('../../public/Mira-Orb-No-Background.png');

type Props = {
  size?: number;
  isDark?: boolean;
  roast?: boolean;
  /** Pulse animation for voice / speaking overlay. */
  speaking?: boolean;
};

/** Mira's avatar — official orb asset; fiery AuroraOrb only in roast mode. */
export default function InsightCompanionMark({
  size = 64,
  isDark = true,
  roast = false,
  speaking = false,
}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.6)).current;
  const animate = roast || speaking;

  useEffect(() => {
    if (!animate) {
      pulse.setValue(1);
      glow.setValue(0);
      return;
    }

    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.55, duration: 850, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [animate, pulse, glow]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {animate && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowRing,
            roast ? styles.glowRingRoast : styles.glowRingNormal,
            {
              width: size * 1.35,
              height: size * 1.35,
              borderRadius: size * 0.675,
              opacity: glow,
              transform: [{ scale: pulse }],
            },
          ]}
        />
      )}
      <Animated.View style={animate ? { transform: [{ scale: pulse }] } : undefined}>
        {roast ? (
          <AuroraOrb
            size={size}
            isDark={isDark}
            clipToCircle
            compact
            vivid
            variant="roast"
          />
        ) : (
          <Image
            source={MIRA_ORB}
            style={{ width: size, height: size }}
            resizeMode="contain"
            fadeDuration={0}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glowRing: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    elevation: 12,
  },
  glowRingRoast: {
    backgroundColor: 'rgba(239,68,68,0.35)',
    shadowColor: '#EF4444',
    shadowRadius: 18,
  },
  glowRingNormal: {
    backgroundColor: 'rgba(139,92,246,0.28)',
    shadowColor: '#8B5CF6',
    shadowRadius: 16,
  },
});
