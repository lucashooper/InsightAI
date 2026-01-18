import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export interface CloudOrbProps {
  size?: number;
  children?: React.ReactNode;
}

const CloudOrb: React.FC<CloudOrbProps> = ({
  size = 320,
  children,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Base glow layer - purple */}
      <View style={[styles.glowLayer, { width: size * 1.2, height: size * 1.2 }]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.4)', 'rgba(124, 58, 237, 0.2)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 0.7, y: 0.9 }}
        />
      </View>

      {/* Second layer - indigo/blue blend */}
      <View style={[styles.glowLayer, { width: size * 1.1, height: size * 1.1, top: size * 0.05 }]}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.35)', 'rgba(59, 130, 246, 0.25)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0.6, y: 0.3 }}
          end={{ x: 0.2, y: 0.8 }}
        />
      </View>

      {/* Third layer - pink/magenta accent */}
      <View style={[styles.glowLayer, { width: size * 0.9, height: size * 0.9, top: size * 0.1, left: size * 0.05 }]}>
        <LinearGradient
          colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.15)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 0.8, y: 0.6 }}
        />
      </View>

      {/* Fourth layer - deep purple center */}
      <View style={[styles.glowLayer, { width: size * 0.7, height: size * 0.7, top: size * 0.15, left: size * 0.15 }]}>
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.5)', 'rgba(109, 40, 217, 0.3)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0.3 }}
          end={{ x: 0.5, y: 0.8 }}
        />
      </View>

      {/* Blur overlay for cloud effect */}
      <BlurView
        intensity={80}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2, overflow: 'hidden' }]}
      />

      {/* Content layer */}
      <View style={styles.contentLayer} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  glowLayer: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  contentLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default CloudOrb;
