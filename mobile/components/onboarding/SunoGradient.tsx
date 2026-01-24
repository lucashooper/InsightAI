import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Clean premium blue gradient background with subtle grain
 * No orbs or radial accents - simple and refined
 */
export default function SunoGradient() {
  return (
    <View style={styles.container}>
      {/* Premium pure black background */}
      <View style={styles.blackBackground} />

      {/* Subtle uniform grain overlay */}
      <Svg width={width} height={height} style={styles.grainOverlay}>
        <Defs>
          <Pattern id="grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <Circle cx="1" cy="1" r="0.3" fill="rgba(255,255,255,0.015)" />
            <Circle cx="3" cy="2" r="0.3" fill="rgba(255,255,255,0.012)" />
            <Circle cx="2" cy="3" r="0.3" fill="rgba(255,255,255,0.018)" />
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
    backgroundColor: '#000000',
  },
  blackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
});
