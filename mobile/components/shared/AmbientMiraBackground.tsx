import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children?: React.ReactNode;
  style?: any;
};

/**
 * Full-screen ambient background for Mira chat.
 * Purple/dark radial gradient that extends to all edges with no clipping.
 */
export default function AmbientMiraBackground({ children, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#1a0d2e', '#0f0520', '#09090B']}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1}}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Radial accent overlay */}
      <View style={styles.radialAccent} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  radialAccent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Simulated radial gradient via opacity layers
    opacity: 0.3,
  },
});
