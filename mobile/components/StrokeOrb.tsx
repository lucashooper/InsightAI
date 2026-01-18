import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface StrokeOrbProps {
  size?: number;
  colors?: string[];
  children?: React.ReactNode;
}

const StrokeOrb: React.FC<StrokeOrbProps> = ({ 
  size = 280, 
  colors = [
    'rgba(91, 124, 219, 1)',   // Blue
    'rgba(124, 92, 224, 1)',   // Purple
    'rgba(74, 95, 217, 1)',    // Deep Blue
  ],
  children 
}) => {
  // Subtle breathing animations for each layer
  const breathe1 = useRef(new Animated.Value(1)).current;
  const breathe2 = useRef(new Animated.Value(1)).current;
  const breathe3 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.35)).current;
  const opacity2 = useRef(new Animated.Value(0.25)).current;
  const opacity3 = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    // Layer 1: Slow breathing (8s cycle)
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathe1, {
            toValue: 1.02,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity1, {
            toValue: 0.4,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breathe1, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity1, {
            toValue: 0.35,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Layer 2: Offset breathing (10s cycle)
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathe2, {
            toValue: 1.03,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0.3,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breathe2, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0.25,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Layer 3: Slowest breathing (12s cycle)
    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathe3, {
            toValue: 1.025,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0.2,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breathe3, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0.15,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Layer 1: Largest, most diffuse */}
      <Animated.View 
        style={[
          styles.layer,
          {
            width: size * 1.1,
            height: size * 1.1,
            borderRadius: (size * 1.1) / 2,
            opacity: opacity1,
            transform: [{ scale: breathe1 }],
            left: -size * 0.05,
            top: -size * 0.05,
          }
        ]}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          <LinearGradient
            colors={[
              'rgba(91, 124, 219, 0.6)',
              'rgba(124, 92, 224, 0.4)',
              'rgba(74, 95, 217, 0.2)',
            ]}
            start={{ x: 0.3, y: 0.2 }}
            end={{ x: 0.7, y: 0.8 }}
            style={styles.gradient}
          />
        </BlurView>
      </Animated.View>

      {/* Layer 2: Medium, offset */}
      <Animated.View 
        style={[
          styles.layer,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: (size * 0.85) / 2,
            opacity: opacity2,
            transform: [{ scale: breathe2 }],
            left: size * 0.075,
            top: size * 0.1,
          }
        ]}
      >
        <BlurView intensity={60} style={styles.blurContainer}>
          <LinearGradient
            colors={[
              'rgba(124, 92, 224, 0.7)',
              'rgba(91, 124, 219, 0.5)',
              'rgba(74, 95, 217, 0.3)',
            ]}
            start={{ x: 0.2, y: 0.3 }}
            end={{ x: 0.8, y: 0.7 }}
            style={styles.gradient}
          />
        </BlurView>
      </Animated.View>

      {/* Layer 3: Core, brightest */}
      <Animated.View 
        style={[
          styles.layer,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: (size * 0.7) / 2,
            opacity: opacity3,
            transform: [{ scale: breathe3 }],
            left: size * 0.15,
            top: size * 0.15,
          }
        ]}
      >
        <BlurView intensity={40} style={styles.blurContainer}>
          <LinearGradient
            colors={[
              'rgba(91, 124, 219, 0.9)',
              'rgba(124, 92, 224, 0.7)',
              'rgba(74, 95, 217, 0.5)',
            ]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={styles.gradient}
          />
        </BlurView>
      </Animated.View>

      {/* Ambient glow layer (no blur, just soft gradient) */}
      <Animated.View 
        style={[
          styles.layer,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: (size * 1.3) / 2,
            opacity: 0.08,
            left: -size * 0.15,
            top: -size * 0.15,
          }
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(91, 124, 219, 0.3)',
            'rgba(124, 92, 224, 0.2)',
            'rgba(0, 0, 0, 0)',
          ]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Content layer */}
      <View style={styles.contentLayer}>
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
  },
  layer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  contentLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default StrokeOrb;
