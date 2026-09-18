import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { AiPersonality } from '../../utils/aiPersonalities';
import type { MoodTier } from '../checkin/types';

/**
 * Insight's companion — a single, soft cloud mesh with a minimal face.
 *
 * One smooth closed spline is the whole body: no overlapping spheres, no
 * clusters. The fill is a Reanimated-driven colour so the mascot can shift
 * tint seamlessly with mood, scroll position or the card it sits on. Glass
 * comes from a top highlight, a rim light and a blurred glow underneath.
 */

export type CloudTint = 'iris' | 'sky' | 'mint' | 'peach' | 'gold' | 'rose';
/** @deprecated use `valence` — kept for API compat. */
export type CloudMood = 'happy' | 'calm' | 'curious';

export const CLOUD_TINT_COLORS: Record<CloudTint, string> = {
  iris: '#CDBBFF',
  sky: '#A6D3FF',
  mint: '#A9EAD1',
  peach: '#FFC7AD',
  gold: '#FFDC8E',
  rose: '#FFB7D3',
};

/** Mood → tint. Soft blue = low / calm, lilac = neutral, mint = content, gold = happy. */
export const MOOD_TINT_COLORS: Record<MoodTier, string> = {
  terrible: '#8FB4F2',
  struggling: '#A9CBFA',
  neutral: '#CDBBFF',
  good: '#A9EAD1',
  amazing: '#FFD98A',
};

/** Mood → facial valence (0 = sad, 1 = joyful). */
export const MOOD_VALENCE: Record<MoodTier, number> = {
  terrible: 0,
  struggling: 0.25,
  neutral: 0.5,
  good: 0.8,
  amazing: 1,
};

const PERSONALITY_TINT: Record<AiPersonality, CloudTint> = {
  default: 'iris',
  balanced: 'iris',
  cheerful: 'gold',
  direct: 'sky',
  playful: 'rose',
  gentle: 'mint',
  roast: 'peach',
  hype: 'gold',
};

export function tintForPersonality(personality: AiPersonality = 'default', isRoast = false): CloudTint {
  if (isRoast) return 'peach';
  return PERSONALITY_TINT[personality] ?? 'iris';
}

export function moodForPersonality(personality: AiPersonality = 'default', isRoast = false): CloudMood {
  if (isRoast) return 'curious';
  if (personality === 'gentle' || personality === 'direct') return 'calm';
  return 'happy';
}

export function resolveTintColor(tint: CloudTint | string): string {
  return (CLOUD_TINT_COLORS as Record<string, string>)[tint] ?? tint;
}

type Props = {
  size?: number;
  /** Named tint or any CSS colour. Changes animate. */
  tint?: CloudTint | string;
  /** Drive the tint from a worklet (e.g. scroll-linked `interpolateColor`). Overrides `tint`. */
  animatedTint?: SharedValue<string>;
  /** 0 = sad … 1 = joyful. Changes animate. */
  valence?: number;
  /** Drive the expression from a worklet. Overrides `valence`. */
  animatedValence?: SharedValue<number>;
  /** @deprecated use `valence`. */
  mood?: CloudMood;
  /** Convenience — maps an AI personality to a tint when `tint` is omitted. */
  personality?: AiPersonality;
  isRoast?: boolean;
  /** Breathing / floating / blinking. Disabled automatically under Reduce Motion. */
  animated?: boolean;
  /** Soft ground shadow beneath the cloud. */
  shadow?: boolean;
  /** `orb` is a full sphere for mood check-in (no flattened belly). */
  variant?: 'cloud' | 'orb';
  style?: StyleProp<ViewStyle>;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BREATHE_MS = 2800;
const FLOAT_MS = 3600;
const BLINK_GAP_MS = 3800;
const TINT_MS = 520;
const EYE_RY = 6.2;

// ─── Body geometry ───────────────────────────────────────────────────────────
// A single closed Catmull-Rom spline through a lobed outline. Computed once.

const CX = 100;
const CY = 104;
const R0 = 58;
const LOBES: Array<[deg: number, amp: number]> = [
  [-150, 0.2],
  [-98, 0.27],
  [-42, 0.22],
  [8, 0.13],
  [178, 0.11],
];
const SIGMA = (24 * Math.PI) / 180;

function wrap(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

function outlinePoints(n = 40): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2 - Math.PI;
    let bump = 0;
    for (const [deg, amp] of LOBES) {
      const d = wrap(th - (deg * Math.PI) / 180);
      bump += amp * Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
    }
    const r = R0 * (1 + bump);
    let x = CX + Math.cos(th) * r;
    let y = CY + Math.sin(th) * r;
    // Flatten the belly so it reads as a cloud rather than a blob.
    const belly = CY + 8;
    if (y > belly) y = belly + (y - belly) * 0.5;
    pts.push([x, y]);
  }
  return pts;
}

function splinePath(pts: Array<[number, number]>): string {
  const n = pts.length;
  const P = (i: number) => pts[(i + n) % n];
  let d = `M ${P(0)[0].toFixed(2)} ${P(0)[1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

export const CLOUD_BODY_PATH = splinePath(outlinePoints());
export const ORB_BODY_PATH = `M 100 36 A 64 64 0 1 1 99.99 36 Z`;

const INK = '#2A2438';

function moodToValence(mood?: CloudMood): number {
  if (mood === 'calm') return 0.6;
  if (mood === 'curious') return 0.7;
  return 0.85;
}

export default function CloudMascot({
  size = 120,
  tint,
  animatedTint,
  valence,
  animatedValence,
  mood,
  personality = 'default',
  isRoast = false,
  animated = true,
  shadow = true,
  variant = 'cloud',
  style,
}: Props) {
  const reduceMotion = useReducedMotion();
  const motion = animated && !reduceMotion;

  const targetColor = resolveTintColor(tint ?? tintForPersonality(personality, isRoast));
  const targetValence = valence ?? moodToValence(mood ?? moodForPersonality(personality, isRoast));

  // ── Tint: from → to crossfade so any colour change is seamless.
  const fromColor = useSharedValue(targetColor);
  const toColor = useSharedValue(targetColor);
  const tintProgress = useSharedValue(1);
  useEffect(() => {
    if (toColor.value === targetColor) return;
    fromColor.value = interpolateColor(tintProgress.value, [0, 1], [fromColor.value, toColor.value]);
    toColor.value = targetColor;
    tintProgress.value = 0;
    tintProgress.value = withTiming(1, { duration: TINT_MS, easing: Easing.inOut(Easing.cubic) });
  }, [targetColor, fromColor, toColor, tintProgress]);

  const fill = useDerivedValue(() => {
    if (animatedTint) return animatedTint.value;
    return interpolateColor(tintProgress.value, [0, 1], [fromColor.value, toColor.value]);
  });

  // ── Expression
  const valenceSV = useSharedValue(targetValence);
  useEffect(() => {
    valenceSV.value = withTiming(targetValence, { duration: 380, easing: Easing.out(Easing.cubic) });
  }, [targetValence, valenceSV]);
  const v = useDerivedValue(() => (animatedValence ? animatedValence.value : valenceSV.value));

  // ── Idle motion
  const breathe = useSharedValue(1);
  const float = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    if (!motion) {
      breathe.value = 1;
      float.value = 0;
      blink.value = 1;
      return;
    }
    breathe.value = withRepeat(withTiming(1.03, { duration: BREATHE_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
    float.value = withRepeat(withTiming(-5, { duration: FLOAT_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
    blink.value = withRepeat(
      withSequence(
        withDelay(BLINK_GAP_MS, withTiming(0.08, { duration: 80, easing: Easing.in(Easing.quad) })),
        withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(float);
      cancelAnimation(blink);
    };
  }, [motion, breathe, float, blink]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }, { scale: breathe.value }],
  }));

  const bodyProps = useAnimatedProps(() => ({ fill: fill.value }));
  const glowProps = useAnimatedProps(() => ({ fill: fill.value }));

  // Eyes: blink + a touch of droop when sad.
  const eyeProps = useAnimatedProps(() => ({
    ry: EYE_RY * blink.value,
    cy: 100 + interpolate(v.value, [0, 1], [2, 0]),
  }));

  // Mouth: frown → wide smile.
  const mouthProps = useAnimatedProps(() => {
    const endY = interpolate(v.value, [0, 0.5, 1], [122, 118, 112]);
    const ctrlY = interpolate(v.value, [0, 0.5, 1], [110, 118, 132]);
    const halfW = interpolate(v.value, [0, 0.5, 1], [11, 12, 16]);
    return { d: `M ${100 - halfW} ${endY} Q 100 ${ctrlY} ${100 + halfW} ${endY}` };
  });

  // Brows: appear and tilt inward when low.
  const browOpacity = useDerivedValue(() => interpolate(v.value, [0, 0.45], [1, 0], 'clamp'));
  const leftBrowProps = useAnimatedProps(() => {
    const tilt = interpolate(v.value, [0, 0.45], [6, 0], 'clamp');
    return { d: `M 72 ${86 + tilt} L 90 ${86 - tilt * 0.4}`, opacity: browOpacity.value };
  });
  const rightBrowProps = useAnimatedProps(() => {
    const tilt = interpolate(v.value, [0, 0.45], [6, 0], 'clamp');
    return { d: `M 110 ${86 - tilt * 0.4} L 128 ${86 + tilt}`, opacity: browOpacity.value };
  });

  // Blush grows with joy.
  const blushProps = useAnimatedProps(() => ({
    opacity: interpolate(v.value, [0.4, 1], [0, 0.4], 'clamp'),
  }));

  const bodyPath = variant === 'orb' ? ORB_BODY_PATH : CLOUD_BODY_PATH;
  const shadowCy = variant === 'orb' ? 176 : 170;
  const shadowRx = variant === 'orb' ? 48 : 56;
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const id = (name: string) => `${name}-${uid}`;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]} pointerEvents="none">
      <Animated.View style={[styles.body, bodyStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <ClipPath id={id('clip')}>
              <Path d={bodyPath} />
            </ClipPath>
            <Filter id={id('blur')} x="-30%" y="-30%" width="160%" height="160%">
              <FeGaussianBlur stdDeviation={9} />
            </Filter>
            <RadialGradient id={id('hi')} cx="76" cy="74" r="74" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.92} />
              <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id={id('shade')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.5" stopColor={INK} stopOpacity={0} />
              <Stop offset="1" stopColor={INK} stopOpacity={0.12} />
            </LinearGradient>
            <RadialGradient id={id('rim')} cx="100" cy="106" r="80" gradientUnits="userSpaceOnUse">
              <Stop offset="0.74" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.55} />
            </RadialGradient>
          </Defs>

          {shadow ? <Ellipse cx={100} cy={shadowCy} rx={shadowRx} ry={9} fill={INK} opacity={0.12} /> : null}

          {/* Soft glow — the same body, blurred and slightly enlarged */}
          <G transform="translate(100 106) scale(1.06) translate(-100 -106)" opacity={0.6}>
            <AnimatedPath animatedProps={glowProps} d={bodyPath} filter={`url(#${id('blur')})`} />
          </G>

          {/* Body */}
          <AnimatedPath animatedProps={bodyProps} d={bodyPath} />
          <G clipPath={`url(#${id('clip')})`}>
            <Rect x={0} y={0} width={200} height={200} fill={`url(#${id('shade')})`} />
            <Rect x={0} y={0} width={200} height={200} fill={`url(#${id('hi')})`} />
            <Rect x={0} y={0} width={200} height={200} fill={`url(#${id('rim')})`} />
            <Ellipse cx={80} cy={66} rx={22} ry={11} fill="#FFFFFF" opacity={0.55} transform="rotate(-16 80 66)" />
          </G>

          {/* Face */}
          <AnimatedCircle animatedProps={blushProps} cx={70} cy={116} r={7} fill="#FF9EC4" />
          <AnimatedCircle animatedProps={blushProps} cx={130} cy={116} r={7} fill="#FF9EC4" />
          <AnimatedPath animatedProps={leftBrowProps} stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          <AnimatedPath animatedProps={rightBrowProps} stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          <AnimatedEllipse animatedProps={eyeProps} cx={84} rx={4.6} fill={INK} />
          <AnimatedEllipse animatedProps={eyeProps} cx={116} rx={4.6} fill={INK} />
          <AnimatedPath animatedProps={mouthProps} stroke={INK} strokeWidth={4.4} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
