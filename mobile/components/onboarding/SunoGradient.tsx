import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Premium pastel multi-gradient background
 * Inspired by Unchained — soft pink, peach, lavender, cream tones
 */
export default function SunoGradient() {
  return (
    <View style={styles.container}>
      {/* Base warm cream gradient */}
      <LinearGradient
        colors={['#fef7f2', '#fdf2ec', '#f8ece8', '#f5eef8', '#fef9f5']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Soft radial color accents via SVG */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Soft pink blob top-right */}
          <RadialGradient id="pinkBlob" cx="80%" cy="15%" rx="50%" ry="40%">
            <Stop offset="0%" stopColor="#f8d7da" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#f8d7da" stopOpacity="0" />
          </RadialGradient>
          {/* Soft lavender blob center-left */}
          <RadialGradient id="lavenderBlob" cx="15%" cy="45%" rx="45%" ry="35%">
            <Stop offset="0%" stopColor="#e8dff5" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#e8dff5" stopOpacity="0" />
          </RadialGradient>
          {/* Soft peach blob bottom */}
          <RadialGradient id="peachBlob" cx="60%" cy="85%" rx="55%" ry="30%">
            <Stop offset="0%" stopColor="#fde2d4" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#fde2d4" stopOpacity="0" />
          </RadialGradient>
          {/* Subtle blue blob top-left */}
          <RadialGradient id="blueBlob" cx="25%" cy="8%" rx="40%" ry="25%">
            <Stop offset="0%" stopColor="#dbeafe" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
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
    opacity: 1,
  },
});
