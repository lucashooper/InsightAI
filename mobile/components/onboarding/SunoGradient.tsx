import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface SunoGradientProps {
  themeColors?: string[];
  themeBlobColors?: {
    pink?: string;
    lavender?: string;
    peach?: string;
    blue?: string;
  };
}

/**
 * Premium pastel multi-gradient background
 * Inspired by Unchained — soft pink, peach, lavender, cream tones
 * Can be customized with theme colors
 */
export default function SunoGradient({ themeColors, themeBlobColors }: SunoGradientProps = {}) {
  const baseColors = themeColors || ['#fef5f8', '#fef0f5', '#f5f0fe', '#f0f9ff', '#fef7f2'];
  const blobColors = themeBlobColors || {
    pink: '#ffc9d9',
    lavender: '#ddd6fe',
    peach: '#fed7aa',
    blue: '#bfdbfe',
  };

  // Dynamically generate evenly-spaced locations to always match the colors array length
  const rawLocations = baseColors.map((_, i) =>
    baseColors.length === 1 ? 0 : i / (baseColors.length - 1)
  );
  const locations = rawLocations as unknown as readonly [number, number, ...number[]];

  return (
    <View style={styles.container}>
      {/* Base warm cream gradient - enhanced for more vibrant pastel tones */}
      <LinearGradient
        colors={baseColors as [string, string, ...string[]]}
        locations={locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Enhanced radial color accents via SVG - more vibrant like Unchained */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Vibrant pink blob top-right */}
          <RadialGradient id="pinkBlob" cx="85%" cy="10%" rx="55%" ry="45%">
            <Stop offset="0%" stopColor="#ffc9d9" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#ffc9d9" stopOpacity="0" />
          </RadialGradient>
          {/* Vibrant lavender blob center-left */}
          <RadialGradient id="lavenderBlob" cx="10%" cy="50%" rx="50%" ry="40%">
            <Stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ddd6fe" stopOpacity="0" />
          </RadialGradient>
          {/* Vibrant peach/orange blob bottom */}
          <RadialGradient id="peachBlob" cx="65%" cy="90%" rx="60%" ry="35%">
            <Stop offset="0%" stopColor="#fed7aa" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
          </RadialGradient>
          {/* Vibrant blue blob top-left */}
          <RadialGradient id="blueBlob" cx="20%" cy="5%" rx="45%" ry="30%">
            <Stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#pinkBlob)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#lavenderBlob)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#peachBlob)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#blueBlob)" />
      </Svg>

      {/* Subtle grain overlay for texture */}
      <Svg width={width} height={height} style={styles.grainOverlay}>
        <Defs>
          <Pattern id="grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="0.3" fill="rgba(0,0,0,0.01)" />
            <Circle cx="3" cy="2" r="0.3" fill="rgba(0,0,0,0.007)" />
            <Circle cx="2" cy="3" r="0.3" fill="rgba(0,0,0,0.012)" />
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
    backgroundColor: '#fef7f2',
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
});
