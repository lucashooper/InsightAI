import React, { useMemo } from 'react';
import { View, StyleSheet, Image, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Canvas, Circle, Group, RadialGradient, vec, Paint, BlurMask, Skia } from '@shopify/react-native-skia';

const PALETTES: Record<string, string[]> = {
  calm: [
    'rgba(91, 124, 219, 1)',
    'rgba(124, 92, 224, 1)',
    'rgba(74, 95, 217, 1)',
    'rgba(255, 163, 112, 1)',
  ],
  insightDark: [
    'rgba(139, 92, 246, 1)',
    'rgba(99, 102, 241, 1)',
    'rgba(45, 212, 191, 1)',
    'rgba(240, 101, 79, 1)',
  ],
  insightLight: [
    'rgba(178, 125, 230, 1)',
    'rgba(168, 85, 247, 1)',
    'rgba(89, 183, 216, 1)',
    'rgba(255, 123, 101, 1)',
  ],
};

export interface MindseraOrbSkiaProps {
  size?: number;
  palette?: keyof typeof PALETTES;
  blurStrong?: number;
  blurMedium?: number;
  blurSoft?: number;
  useWarmAccent?: boolean;
  /** Frosted-glass shell with specular highlight — home hero orb. */
  glassmorphic?: boolean;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const NOISE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAI0lEQVQYV2NkYGD4z0ABYQYGBn4GhkYGBgYG/8cQGhgYGAAAK5sCBQe0I6cAAAAASUVORK5CYII=';

const MindseraOrbSkia: React.FC<MindseraOrbSkiaProps> = ({
  size = 340,
  palette,
  blurStrong = 110,
  blurMedium = 90,
  blurSoft = 70,
  useWarmAccent = true,
  glassmorphic = false,
  isDark = true,
  style,
  children,
}) => {
  const d = size;
  const r = d / 2;
  const resolvedPalette = palette ?? (isDark ? 'insightDark' : 'insightLight');
  const colors = PALETTES[resolvedPalette] || PALETTES.calm;
  const [c1, c2, c3, accent] = colors;

  const blurScale = glassmorphic ? Math.max(0.55, size / 340) : 1;
  const strongBlur = blurStrong * blurScale;
  const mediumBlur = blurMedium * blurScale;
  const softBlur = blurSoft * blurScale;

  const blobs = useMemo(
    () => [
      { cx: r * 0.62, cy: r * 0.48, rr: r * 0.88, start: c1, end: 'rgba(139,92,246,0)', blur: strongBlur },
      { cx: r * 1.05, cy: r * 0.72, rr: r * 0.72, start: c2, end: 'rgba(99,102,241,0)', blur: mediumBlur },
      { cx: r * 0.88, cy: r * 1.02, rr: r * 0.64, start: c3, end: 'rgba(45,212,191,0)', blur: softBlur },
      ...(useWarmAccent
        ? [{ cx: r * 0.58, cy: r * 1.08, rr: r * 0.58, start: accent, end: 'rgba(240,101,79,0)', blur: softBlur }]
        : []),
    ],
    [r, c1, c2, c3, accent, strongBlur, mediumBlur, softBlur, useWarmAccent],
  );

  // Circular clip path to ensure perfect circular orb with no square artifacts
  const clipPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(r, r, r);
    return p;
  }, [r]);

  return (
    <View
      style={[
        glassmorphic && (isDark ? styles.shadowDark : styles.shadowLight),
        style,
      ]}
      pointerEvents="none"
    >
      <View style={[styles.container, { width: d, height: d, borderRadius: r }]}>
        <Canvas style={{ width: d, height: d }}>
          <Group clip={clipPath}>
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

        {glassmorphic && (
          <>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']
                  : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']
              }
              start={{ x: 0.12, y: 0 }}
              end={{ x: 0.75, y: 0.85 }}
              style={[StyleSheet.absoluteFill, { borderRadius: r }]}
              pointerEvents="none"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.glassRim,
                {
                  borderRadius: r,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
                },
              ]}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.18)']}
              start={{ x: 0.5, y: 0.55 }}
              end={{ x: 0.5, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: r, opacity: isDark ? 0.35 : 0.2 }]}
              pointerEvents="none"
            />
          </>
        )}

        <Image
          source={{ uri: NOISE_BASE64 }}
          style={[StyleSheet.absoluteFill, { opacity: glassmorphic ? 0.035 : 0.025, borderRadius: r }]}
          resizeMode="repeat"
        />

        <View style={styles.content} pointerEvents="box-none">{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowDark: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
  },
  shadowLight: {
    shadowColor: 'rgba(139, 92, 246, 0.45)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 12,
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  glassRim: {
    borderWidth: 1,
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
