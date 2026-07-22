import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle, RadialGradient, Stop } from 'react-native-svg';

const DARK_BASE = ['#101019', '#09090f', '#050508'] as const;

interface SunoGradientProps {
  themeColors?: string[];
  themeBlobColors?: {
    pink?: string;
    lavender?: string;
    peach?: string;
    blue?: string;
  };
}

function isDarkPalette(colors?: string[]): boolean {
  if (!colors?.length) return true;
  const hex = colors[0].replace('#', '');
  if (hex.length < 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r + g + b) / 3 < 96;
}

/**
 * Premium onboarding background — moody base + soft color blobs.
 * Always use as the first child of a flex:1 screen; keep the screen container transparent.
 */
export default function SunoGradient({ themeColors, themeBlobColors }: SunoGradientProps = {}) {
  const { width, height } = useWindowDimensions();
  const dark = isDarkPalette(themeColors);
  const baseColors = themeColors?.length ? themeColors : [...DARK_BASE];
  const blobColors = themeBlobColors || (dark
    ? {
        pink: 'rgba(139, 92, 246, 0.55)',
        lavender: 'rgba(99, 102, 241, 0.45)',
        peach: 'rgba(240, 101, 79, 0.30)',
        blue: 'rgba(45, 212, 191, 0.28)',
      }
    : {
        pink: '#ffc9d9',
        lavender: '#ddd6fe',
        peach: '#fed7aa',
        blue: '#bfdbfe',
      });

  const rawLocations = baseColors.map((_, i) =>
    baseColors.length === 1 ? 0 : i / (baseColors.length - 1),
  );
  const locations = rawLocations as unknown as readonly [number, number, ...number[]];

  const pinkOpacity = dark ? [0.55, 0] : [0.45, 0];
  const lavenderOpacity = dark ? [0.48, 0] : [0.4, 0];
  const peachOpacity = dark ? [0.38, 0] : [0.4, 0];
  const blueOpacity = dark ? [0.34, 0] : [0.35, 0];

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={baseColors as [string, string, ...string[]]}
        locations={locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient id="pinkBlob" cx="82%" cy="12%" rx="55%" ry="45%">
            <Stop offset="0%" stopColor={blobColors.pink} stopOpacity={pinkOpacity[0]} />
            <Stop offset="100%" stopColor={blobColors.pink} stopOpacity={pinkOpacity[1]} />
          </RadialGradient>
          <RadialGradient id="lavenderBlob" cx="12%" cy="48%" rx="50%" ry="40%">
            <Stop offset="0%" stopColor={blobColors.lavender} stopOpacity={lavenderOpacity[0]} />
            <Stop offset="100%" stopColor={blobColors.lavender} stopOpacity={lavenderOpacity[1]} />
          </RadialGradient>
          <RadialGradient id="peachBlob" cx="68%" cy="88%" rx="58%" ry="38%">
            <Stop offset="0%" stopColor={blobColors.peach} stopOpacity={peachOpacity[0]} />
            <Stop offset="100%" stopColor={blobColors.peach} stopOpacity={peachOpacity[1]} />
          </RadialGradient>
          <RadialGradient id="blueBlob" cx="22%" cy="8%" rx="45%" ry="32%">
            <Stop offset="0%" stopColor={blobColors.blue} stopOpacity={blueOpacity[0]} />
            <Stop offset="100%" stopColor={blobColors.blue} stopOpacity={blueOpacity[1]} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#pinkBlob)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#lavenderBlob)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#peachBlob)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#blueBlob)" />
      </Svg>

      <Svg width={width} height={height} style={styles.grainOverlay}>
        <Defs>
          <Pattern id="grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="0.3" fill={dark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)'} />
            <Circle cx="3" cy="2" r="0.3" fill={dark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.007)'} />
            <Circle cx="2" cy="3" r="0.3" fill={dark ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.012)'} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#grain)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
});
