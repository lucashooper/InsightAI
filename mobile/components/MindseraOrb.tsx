import React, { useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, G, ClipPath, Circle, Ellipse, Filter, FeGaussianBlur } from 'react-native-svg';

// Simple RGB palettes with a subtle warm accent available
// Values tuned to blend softly when blurred
const PALETTES: Record<string, string[]> = {
  calm: [
    'rgba(91, 124, 219, 1)',   // indigo-blue
    'rgba(124, 92, 224, 1)',   // violet
    'rgba(74, 95, 217, 1)',    // deep blue
    'rgba(255, 163, 112, 1)',  // warm accent (orange)
  ],
  vibrant: [
    'rgba(90, 180, 255, 1)',
    'rgba(168, 95, 255, 1)',
    'rgba(60, 110, 255, 1)',
    'rgba(255, 130, 130, 1)',
  ],
};

export interface MindseraOrbProps {
  size?: number;               // diameter in px
  palette?: keyof typeof PALETTES;
  // intensity of blur per layer; higher => softer
  blurA?: number;
  blurB?: number;
  blurC?: number;
  // enable a subtle warm tint at low opacity for depth
  useWarmAccent?: boolean;
  children?: React.ReactNode;
}

// Base64 tiny monochrome noise tile (8x8) to repeat for subtle grain
// Generated programmatically; feel free to replace with your own.
const NOISE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAI0lEQVQYV2NkYGD4z0ABYQYGBn4GhkYGBgYG/8cQGhgYGAAAK5sCBQe0I6cAAAAASUVORK5CYII=';

const MindseraOrb: React.FC<MindseraOrbProps> = ({
  size = 340,
  palette = 'calm',
  blurA = 40,
  blurB = 60,
  blurC = 80,
  useWarmAccent = true,
  children,
}) => {
  const colors = PALETTES[palette] || PALETTES.calm;

  const [c1, c2, c3, accent] = colors;

  // Define radial gradients with soft, transparent edges
  const gradients = useMemo(() => (
    <Defs>
      {/* Large diffuse gradient: top-left biased */}
      <RadialGradient id="gradA" cx="28%" cy="22%" r="60%">
        <Stop offset="0%" stopColor={c1} stopOpacity={0.42} />
        <Stop offset="60%" stopColor={c1} stopOpacity={0.2} />
        <Stop offset="100%" stopColor={c1} stopOpacity={0} />
      </RadialGradient>

      {/* Medium gradient: right-biased violet */}
      <RadialGradient id="gradB" cx="72%" cy="40%" r="55%">
        <Stop offset="0%" stopColor={c2} stopOpacity={0.38} />
        <Stop offset="60%" stopColor={c2} stopOpacity={0.18} />
        <Stop offset="100%" stopColor={c2} stopOpacity={0} />
      </RadialGradient>

      {/* Core gradient: center-deep blue */}
      <RadialGradient id="gradC" cx="50%" cy="58%" r="42%">
        <Stop offset="0%" stopColor={c3} stopOpacity={0.46} />
        <Stop offset="65%" stopColor={c3} stopOpacity={0.2} />
        <Stop offset="100%" stopColor={c3} stopOpacity={0} />
      </RadialGradient>

      {/* Optional warm tint for premium depth */}
      <RadialGradient id="gradWarm" cx="32%" cy="70%" r="48%">
        <Stop offset="0%" stopColor={accent} stopOpacity={0.1} />
        <Stop offset="70%" stopColor={accent} stopOpacity={0.05} />
        <Stop offset="100%" stopColor={accent} stopOpacity={0} />
      </RadialGradient>

      {/* Per-layer blur filters */}
      <Filter id="blurA" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur stdDeviation={blurC} />
      </Filter>
      <Filter id="blurB" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur stdDeviation={blurB} />
      </Filter>
      <Filter id="blurC" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur stdDeviation={blurA} />
      </Filter>

      {/* Circular clip so there is never a square plate visible */}
      <ClipPath id="orbClip">
        <Circle cx="50%" cy="50%" r="50%" />
      </ClipPath>
    </Defs>
  ), [c1, c2, c3, accent]);

  const d = size; // svg viewport size

  return (
    <View style={[styles.container, { width: d, height: d, borderRadius: d / 2, overflow: 'hidden' }]} pointerEvents="none">
      <Svg width={d} height={d}>
        {gradients}
        {/* Clip entire group to a perfect circle */}
        <G clipPath="url(#orbClip)">
          {/* Three blurred clouds with different offsets and filters */}
          <G filter="url(#blurA)">
            <Rect x={-d * 0.1} y={-d * 0.08} width={d * 1.2} height={d * 1.2} fill="url(#gradA)" />
          </G>
          <G filter="url(#blurB)">
            <Rect x={d * 0.05} y={d * 0.12} width={d * 0.95} height={d * 0.95} fill="url(#gradB)" />
          </G>
          <G filter="url(#blurC)">
            <Rect x={d * 0.15} y={d * 0.18} width={d * 0.75} height={d * 0.75} fill="url(#gradC)" />
            {useWarmAccent && (
              <Rect x={d * 0.1} y={d * 0.5} width={d * 0.9} height={d * 0.6} fill="url(#gradWarm)" />
            )}
          </G>
        </G>
      </Svg>

      {/* Very subtle noise to mitigate banding */}
      <Image source={{ uri: NOISE_BASE64 }} style={[StyleSheet.absoluteFill, { opacity: 0.03 }]} resizeMode="repeat" />

      {/* Slot children centered */}
      <View style={styles.content} pointerEvents="box-none">{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  blurWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MindseraOrb;
