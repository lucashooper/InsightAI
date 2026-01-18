import React, { useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Canvas, Circle, Group, RadialGradient, vec, Paint, BlurMask, Skia } from '@shopify/react-native-skia';

const PALETTES: Record<string, string[]> = {
  calm: [
    'rgba(91, 124, 219, 1)',   // indigo-blue
    'rgba(124, 92, 224, 1)',   // violet
    'rgba(74, 95, 217, 1)',    // deep blue
    'rgba(255, 163, 112, 1)',  // warm accent
  ],
};

export interface MindseraOrbSkiaProps {
  size?: number; // diameter
  palette?: keyof typeof PALETTES;
  // Blur radii in px for different blobs
  blurStrong?: number; // ~100-120
  blurMedium?: number; // ~80-100
  blurSoft?: number;   // ~60-80
  useWarmAccent?: boolean;
  children?: React.ReactNode;
}

const NOISE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAI0lEQVQYV2NkYGD4z0ABYQYGBn4GhkYGBgYG/8cQGhgYGAAAK5sCBQe0I6cAAAAASUVORK5CYII=';

const MindseraOrbSkia: React.FC<MindseraOrbSkiaProps> = ({
  size = 340,
  palette = 'calm',
  blurStrong = 110,
  blurMedium = 90,
  blurSoft = 70,
  useWarmAccent = true,
  children,
}) => {
  const d = size;
  const r = d / 2;
  const colors = PALETTES[palette] || PALETTES.calm;
  const [c1, c2, c3, accent] = colors;

  // Blob definitions: one luminous read (not countable layers)
  // Centers and radii are intentionally offset to blend into one atmospheric glow.
  const blobs = useMemo(
    () => [
      // Large diffuse indigo (top-left)
      { cx: r * 0.7, cy: r * 0.6, rr: r * 1.05, start: c1, end: 'rgba(91,124,219,0)', blur: blurStrong },
      // Violet energy (right)
      { cx: r * 1.25, cy: r * 0.85, rr: r * 0.9, start: c2, end: 'rgba(124,92,224,0)', blur: blurMedium },
      // Deep blue core (slightly below center)
      { cx: r * 1.0, cy: r * 1.15, rr: r * 0.75, start: c3, end: 'rgba(74,95,217,0)', blur: blurSoft },
      // Optional warm accent (subtle)
      ...(useWarmAccent
        ? [{ cx: r * 0.8, cy: r * 1.25, rr: r * 0.85, start: accent, end: 'rgba(255,163,112,0)', blur: blurSoft }]
        : []),
    ],
    [r, c1, c2, c3, accent, blurStrong, blurMedium, blurSoft, useWarmAccent]
  );

  // Circular clip path to ensure perfect circular orb with no square artifacts
  const clipPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(r, r, r);
    return p;
  }, [r]);

  return (
    <View style={[styles.container, { width: d, height: d, borderRadius: r }]}
      pointerEvents="none"
    >
      {/* Skia canvas clipped to a perfect circle */}
      <Canvas style={{ width: d, height: d }}>
        <Group clip={clipPath}> 
          {/* Draw multiple additive blurred radial gradients that read as one light source */}
          {blobs.map((b, i) => (
            <Circle key={i} c={vec(b.cx, b.cy)} r={b.rr}>
              <Paint blendMode="plus">
                <RadialGradient c={vec(b.cx, b.cy)} r={b.rr} colors={[b.start, b.end]} positions={[0, 1]} />
                <BlurMask blur={b.blur} style="normal" />
              </Paint>
            </Circle>
          ))}
        </Group>
      </Canvas>

      {/* Ultra subtle noise for banding mitigation */}
      <Image
        source={{ uri: NOISE_BASE64 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.025, borderRadius: r, overflow: 'hidden' }]}
        resizeMode="repeat"
      />

      {/* Slot children (greeting) */}
      <View style={styles.content} pointerEvents="box-none">{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
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

export default MindseraOrbSkia;
