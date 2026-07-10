import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Polygon, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { MoodTier } from './types';
import { MOOD_TINTS } from './wordBanks';

type Props = {
  tier: MoodTier;
  size?: number;
};

const STROKE = 3;
const EYE_R = 3.5;
const FACE_CENTER_Y = 58;

function TerribleIcon({ size, accent }: { size: number; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <RadialGradient id="terribleGlow" cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="60" cy="58" r="46" fill="url(#terribleGlow)" />
      <Polygon
        points="60,22 74,48 102,48 80,64 88,92 60,76 32,92 40,64 18,48 46,48"
        fill="none"
        stroke={accent}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Circle cx="48" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Circle cx="72" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Path d="M44 72 Q60 58 76 72" stroke={accent} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function StrugglingIcon({ size, accent }: { size: number; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <RadialGradient id="strugglingGlow" cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="60" cy="58" r="46" fill="url(#strugglingGlow)" />
      <Circle cx="60" cy="58" r="34" fill="none" stroke={accent} strokeWidth={STROKE} />
      <Circle cx="48" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Circle cx="72" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Path d="M44 70 Q60 78 76 70" stroke={accent} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function NeutralIcon({ size, accent }: { size: number; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <RadialGradient id="neutralGlow" cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="60" cy="58" r="46" fill="url(#neutralGlow)" />
      <Polygon
        points="60,24 86,40 86,74 60,90 34,74 34,40"
        fill="none"
        stroke={accent}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Circle cx="48" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Circle cx="72" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Path d="M44 66 L76 66" stroke={accent} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

function GoodIcon({ size, accent }: { size: number; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <RadialGradient id="goodGlow" cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="60" cy="58" r="46" fill="url(#goodGlow)" />
      <G>
        <Path
          d="M60 24 C78 24 92 38 92 54 C92 72 76 88 60 94 C44 88 28 72 28 54 C28 38 42 24 60 24 Z"
          fill="none"
          stroke={accent}
          strokeWidth={STROKE}
        />
        <Circle cx="48" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
        <Circle cx="72" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
        <Path d="M44 64 Q60 76 76 64" stroke={accent} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

function AmazingIcon({ size, accent }: { size: number; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <RadialGradient id="amazingGlow" cx="50%" cy="48%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="60" cy="58" r="46" fill="url(#amazingGlow)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <Path
          key={deg}
          d="M60 16 L63 26 L60 22 L57 26 Z"
          fill={accent}
          opacity="0.75"
          rotation={deg}
          origin="60,60"
        />
      ))}
      <Circle cx="60" cy="58" r="30" fill="none" stroke={accent} strokeWidth={STROKE} />
      <Circle cx="48" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Circle cx="72" cy={FACE_CENTER_Y - 4} r={EYE_R} fill={accent} />
      <Path d="M42 62 Q60 80 78 62" stroke={accent} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const ICONS: Record<MoodTier, React.FC<{ size: number; accent: string }>> = {
  terrible: TerribleIcon,
  struggling: StrugglingIcon,
  neutral: NeutralIcon,
  good: GoodIcon,
  amazing: AmazingIcon,
};

const ALL_TIERS: MoodTier[] = ['terrible', 'struggling', 'neutral', 'good', 'amazing'];

export default function MoodIcon({ tier, size = 160 }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacities = useRef(
    ALL_TIERS.reduce(
      (acc, t) => {
        acc[t] = new Animated.Value(t === tier ? 1 : 0);
        return acc;
      },
      {} as Record<MoodTier, Animated.Value>,
    ),
  ).current;

  useEffect(() => {
    ALL_TIERS.forEach((t) => {
      Animated.timing(opacities[t], {
        toValue: t === tier ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.04, duration: 90, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [tier]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {ALL_TIERS.map((t) => {
          const Icon = ICONS[t];
          return (
            <Animated.View key={t} style={[styles.layer, { opacity: opacities[t] }]}>
              <Icon size={size} accent={MOOD_TINTS[t].accent} />
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
