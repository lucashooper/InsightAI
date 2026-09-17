import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { seededRandom, type CardPalette } from '../../utils/cardPalette';

/**
 * Procedural illustrations for cards, heroes and onboarding.
 *
 * Nothing here is a static asset: every scene is generated from a seed and the
 * card's palette, so each card gets bespoke art that still belongs to the same
 * visual family (soft hills, round trees, puffy clouds, bokeh orbs, waves).
 */

export type IllustrationVariant = 'hills' | 'trees' | 'clouds' | 'orbs' | 'waves' | 'sunrise';

const VARIANTS: IllustrationVariant[] = ['hills', 'trees', 'clouds', 'orbs', 'waves', 'sunrise'];

export function pickIllustration(seed: string): IllustrationVariant {
  const rnd = seededRandom(`${seed}:variant`);
  return VARIANTS[Math.floor(rnd() * VARIANTS.length)];
}

/** Suggest a scene for a category so related cards rhyme. */
export function illustrationForCategory(category?: string | null): IllustrationVariant {
  switch ((category ?? '').toLowerCase()) {
    case 'sleep':
      return 'clouds';
    case 'mindfulness':
    case 'thinking':
      return 'orbs';
    case 'exercise':
    case 'habits':
      return 'hills';
    case 'coping':
    case 'anxiety':
    case 'resilience':
      return 'waves';
    case 'social':
    case 'relationships':
    case 'gratitude':
      return 'sunrise';
    case 'nutrition':
      return 'trees';
    default:
      return 'hills';
  }
}

type Props = {
  seed: string;
  palette: CardPalette;
  variant?: IllustrationVariant | 'auto';
  /** Overall opacity of the art — lower for text-heavy cards. */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  /** Anchor of the scene inside its frame. */
  align?: 'bottom' | 'right' | 'center';
};

const W = 320;
const H = 200;

type Rnd = () => number;
const between = (rnd: Rnd, min: number, max: number) => min + (max - min) * rnd();

function hillPath(baseY: number, amp: number, phase: number, width = W, height = H): string {
  // A gentle two-crest hill across the full width, closed to the bottom edge.
  const y0 = baseY + Math.sin(phase) * amp * 0.3;
  const c1x = width * 0.25;
  const c1y = baseY - amp * (0.8 + Math.sin(phase + 1) * 0.3);
  const midY = baseY - amp * 0.15;
  const c2x = width * 0.75;
  const c2y = baseY - amp * (0.9 + Math.cos(phase) * 0.35);
  const y1 = baseY + Math.cos(phase) * amp * 0.25;
  return `M 0 ${y0} Q ${c1x} ${c1y} ${width / 2} ${midY} Q ${c2x} ${c2y} ${width} ${y1} L ${width} ${height} L 0 ${height} Z`;
}

function RoundTree({
  x,
  y,
  r,
  fill,
  trunk,
  tall = 1,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  trunk: string;
  tall?: number;
}) {
  return (
    <G>
      <Rect x={x - 1.6} y={y} width={3.2} height={r * 1.1 * tall} rx={1.6} fill={trunk} opacity={0.75} />
      <Ellipse cx={x} cy={y} rx={r} ry={r * (1.05 + 0.25 * tall)} fill={fill} />
      <Ellipse cx={x - r * 0.3} cy={y - r * 0.35} rx={r * 0.38} ry={r * 0.5} fill="#FFFFFF" opacity={0.22} />
    </G>
  );
}

function Cloud({ x, y, s, opacity }: { x: number; y: number; s: number; opacity: number }) {
  return (
    <G opacity={opacity}>
      <Circle cx={x} cy={y} r={14 * s} fill="#FFFFFF" />
      <Circle cx={x - 14 * s} cy={y + 4 * s} r={10 * s} fill="#FFFFFF" />
      <Circle cx={x + 15 * s} cy={y + 3 * s} r={11 * s} fill="#FFFFFF" />
      <Ellipse cx={x} cy={y + 7 * s} rx={26 * s} ry={9 * s} fill="#FFFFFF" />
    </G>
  );
}

function Scene({ seed, palette, variant }: { seed: string; palette: CardPalette; variant: IllustrationVariant }) {
  const rnd = useMemo(() => seededRandom(`${seed}:${variant}`), [seed, variant]);
  const uid = useMemo(() => Math.abs(Math.floor(seededRandom(seed)() * 1e9)).toString(36), [seed]);
  const gid = (n: string) => `${n}-${uid}`;

  switch (variant) {
    case 'hills':
    case 'trees': {
      const phase = between(rnd, 0, Math.PI * 2);
      const treeCount = variant === 'trees' ? 5 : 3;
      const trees = Array.from({ length: treeCount }, (_, i) => {
        const x = between(rnd, 30, W - 30);
        const r = between(rnd, variant === 'trees' ? 14 : 10, variant === 'trees' ? 26 : 18);
        const y = H - between(rnd, 62, 96);
        const fills = [palette.glowAlt, palette.pop, palette.accent, '#FFFFFF'];
        return { x, r, y, fill: fills[i % fills.length], tall: between(rnd, 0.9, 1.5) };
      });
      const sunX = between(rnd, W * 0.6, W * 0.9);
      return (
        <>
          <Defs>
            <LinearGradient id={gid('h1')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={palette.glow} stopOpacity={0.55} />
              <Stop offset="1" stopColor={palette.glow} stopOpacity={0.85} />
            </LinearGradient>
            <LinearGradient id={gid('h2')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={palette.glowAlt} stopOpacity={0.8} />
              <Stop offset="1" stopColor={palette.glowAlt} stopOpacity={1} />
            </LinearGradient>
            <LinearGradient id={gid('h3')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
              <Stop offset="1" stopColor={palette.gradient[2]} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Circle cx={sunX} cy={between(rnd, 30, 60)} r={between(rnd, 18, 28)} fill="#FFFFFF" opacity={0.7} />
          <Path d={hillPath(H - 78, 34, phase)} fill={`url(#${gid('h1')})`} />
          <Path d={hillPath(H - 52, 26, phase + 2.1)} fill={`url(#${gid('h2')})`} />
          {trees.map((t, i) => (
            <RoundTree key={i} x={t.x} y={t.y} r={t.r} fill={t.fill} trunk={palette.ink} tall={t.tall} />
          ))}
          <Path d={hillPath(H - 26, 18, phase + 4.2)} fill={`url(#${gid('h3')})`} />
        </>
      );
    }

    case 'clouds': {
      const clouds = Array.from({ length: 4 }, () => ({
        x: between(rnd, 30, W - 30),
        y: between(rnd, 40, H - 40),
        s: between(rnd, 0.9, 1.9),
        o: between(rnd, 0.5, 0.9),
      }));
      return (
        <>
          <Circle cx={between(rnd, 40, W - 40)} cy={between(rnd, 30, 70)} r={30} fill={palette.glowAlt} opacity={0.55} />
          {clouds.map((c, i) => (
            <Cloud key={i} x={c.x} y={c.y} s={c.s} opacity={c.o} />
          ))}
          <Ellipse cx={W / 2} cy={H + 30} rx={W * 0.7} ry={70} fill="#FFFFFF" opacity={0.6} />
        </>
      );
    }

    case 'orbs': {
      const orbs = Array.from({ length: 7 }, (_, i) => ({
        x: between(rnd, 0, W),
        y: between(rnd, 0, H),
        r: between(rnd, 14, 56),
        fill: [palette.glow, palette.glowAlt, palette.pop, '#FFFFFF'][i % 4],
        o: between(rnd, 0.28, 0.6),
      }));
      return (
        <>
          <Defs>
            <LinearGradient id={gid('sheen')} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {orbs.map((o, i) => (
            <G key={i} opacity={o.o}>
              <Circle cx={o.x} cy={o.y} r={o.r} fill={o.fill} />
              <Circle cx={o.x} cy={o.y} r={o.r} fill={`url(#${gid('sheen')})`} />
            </G>
          ))}
        </>
      );
    }

    case 'waves': {
      const phase = between(rnd, 0, Math.PI * 2);
      const wave = (baseY: number, amp: number, k: number, p: number) => {
        let d = `M 0 ${baseY}`;
        const steps = 8;
        for (let i = 1; i <= steps; i += 1) {
          const x = (W / steps) * i;
          const px = x - W / steps / 2;
          const py = baseY + Math.sin(k * i + p) * amp;
          d += ` Q ${px} ${py} ${x} ${baseY + Math.sin(k * (i + 0.5) + p) * amp * 0.4}`;
        }
        return `${d} L ${W} ${H} L 0 ${H} Z`;
      };
      return (
        <>
          <Circle cx={between(rnd, W * 0.55, W * 0.85)} cy={between(rnd, 34, 64)} r={24} fill="#FFFFFF" opacity={0.75} />
          <Path d={wave(H - 84, 16, 1.6, phase)} fill={palette.glow} opacity={0.55} />
          <Path d={wave(H - 60, 14, 1.9, phase + 1.4)} fill={palette.glowAlt} opacity={0.75} />
          <Path d={wave(H - 36, 12, 2.3, phase + 2.8)} fill="#FFFFFF" opacity={0.85} />
        </>
      );
    }

    case 'sunrise':
    default: {
      const cx = between(rnd, W * 0.35, W * 0.65);
      const cy = H - 40;
      return (
        <>
          <Defs>
            <LinearGradient id={gid('sun')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
              <Stop offset="1" stopColor={palette.pop} stopOpacity={0.9} />
            </LinearGradient>
          </Defs>
          {[150, 118, 86].map((r, i) => (
            <Circle key={r} cx={cx} cy={cy} r={r} fill={i % 2 ? palette.glowAlt : palette.glow} opacity={0.22 + i * 0.1} />
          ))}
          <Circle cx={cx} cy={cy} r={52} fill={`url(#${gid('sun')})`} />
          <Path d={hillPath(H - 30, 22, between(rnd, 0, 6))} fill="#FFFFFF" opacity={0.9} />
        </>
      );
    }
  }
}

export default function CardIllustration({
  seed,
  palette,
  variant = 'auto',
  opacity = 1,
  style,
  align = 'bottom',
}: Props) {
  const resolved: IllustrationVariant = variant === 'auto' ? pickIllustration(seed) : variant;
  const aspect = align === 'right' ? 'xMaxYMax slice' : align === 'center' ? 'xMidYMid slice' : 'xMidYMax slice';

  return (
    <View pointerEvents="none" style={[styles.frame, { opacity }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={aspect}>
        <Scene seed={seed} palette={palette} variant={resolved} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
});
