import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';

const PURPLE_ELLIPSE = require('../../public/purple-ellipse-blur.png');

export const ONBOARDING_BG = '#090A0F';

/** Figma-style -4% tracking for onboarding headings */
export function onboardingHeadingTracking(fontSize: number): number {
  return fontSize * -0.04;
}

/**
 * Soft Insight onboarding ambient — #090A0F + purple ellipse + grain + stars.
 * Stars stay subtle (≤0.2 opacity) so they read as atmosphere, not noise.
 */
export default function OnboardingAmbientBackground() {
  const { width, height } = useWindowDimensions();

  const stars = useMemo(() => {
    const out: { x: number; y: number; r: number; opacity: number }[] = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 88; i++) {
      const x = rand() * width;
      const y = rand() * height;
      const tier = rand();
      // Soft, slightly larger dots + capped opacity ≈ blurred ambient field
      out.push({
        x,
        y,
        r: tier > 0.88 ? 2.2 : tier > 0.55 ? 1.5 : 1.05,
        opacity: tier > 0.88 ? 0.2 : tier > 0.55 ? 0.14 : 0.08,
      });
    }
    return out;
  }, [width, height]);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: ONBOARDING_BG }]} />

      <Image
        source={PURPLE_ELLIPSE}
        style={styles.ellipse}
        resizeMode="contain"
        fadeDuration={0}
      />
      <Image
        source={PURPLE_ELLIPSE}
        style={styles.ellipseSoft}
        resizeMode="contain"
        fadeDuration={0}
      />

      <Svg width={width} height={height} style={styles.grainOverlay}>
        <Defs>
          <Pattern id="onbGrain" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <Circle cx="0.5" cy="0.5" r="0.35" fill="rgba(255,255,255,0.045)" />
            <Circle cx="2" cy="1.5" r="0.25" fill="rgba(255,255,255,0.028)" />
            <Circle cx="1.2" cy="2.4" r="0.3" fill="rgba(255,255,255,0.032)" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#onbGrain)" />
      </Svg>

      {/* Soft starfield — low opacity layer reads as slight blur */}
      <View style={styles.starLayer}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {stars.map((s, i) => (
            <Circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={`rgba(255,255,255,${s.opacity})`}
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: ONBOARDING_BG,
    overflow: 'hidden',
  },
  ellipse: {
    position: 'absolute',
    width: '155%',
    height: '78%',
    alignSelf: 'center',
    left: '-27.5%',
    top: '12%',
    opacity: 1,
  },
  ellipseSoft: {
    position: 'absolute',
    width: '120%',
    height: '55%',
    left: '-10%',
    top: '28%',
    opacity: 0.55,
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.28,
  },
  starLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
});
