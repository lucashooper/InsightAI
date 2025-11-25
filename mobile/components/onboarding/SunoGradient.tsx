import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

/**
 * Suno-style dynamic gradient background with irregular orbs, heavy blur, and subtle noise
 * Multi-layered purple → magenta → deep blue gradient with overlapping, glowing shapes
 */
export default function SunoGradient() {
  // Animation values for organic blob movement (7 blobs for depth)
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const blob3Anim = useRef(new Animated.Value(0)).current;
  const blob4Anim = useRef(new Animated.Value(0)).current;
  const blob5Anim = useRef(new Animated.Value(0)).current;
  const blob6Anim = useRef(new Animated.Value(0)).current;
  const blob7Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoopAnimation = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start all animations with different durations for organic feel
    Animated.parallel([
      createLoopAnimation(blob1Anim, 14000),
      createLoopAnimation(blob2Anim, 17000),
      createLoopAnimation(blob3Anim, 19000),
      createLoopAnimation(blob4Anim, 22000),
      createLoopAnimation(blob5Anim, 16000),
      createLoopAnimation(blob6Anim, 20000),
      createLoopAnimation(blob7Anim, 18000),
    ]).start();
  }, []);

  // Blob 1: Top-left purple orb
  const blob1TranslateY = blob1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });
  const blob1Scale = blob1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  // Blob 2: Right magenta orb
  const blob2TranslateX = blob2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });
  const blob2TranslateY = blob2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  // Blob 3: Bottom-left deep blue orb
  const blob3Scale = blob3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const blob3Rotate = blob3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  // Blob 4: Center violet orb
  const blob4TranslateX = blob4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });
  const blob4Scale = blob4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  // Blob 5: Pink accent - Top right
  const blob5TranslateY = blob5Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });
  const blob5Scale = blob5Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  // Blob 6: Purple mid - Center left
  const blob6TranslateX = blob6Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 35],
  });
  const blob6Rotate = blob6Anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-20deg'],
  });

  // Blob 7: Deep indigo - Bottom right
  const blob7Scale = blob7Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const blob7TranslateY = blob7Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  return (
    <View style={styles.container}>
      {/* Base dark gradient */}
      <LinearGradient
        colors={['#0a0118', '#0f0520', '#000000']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob 1: Deep Purple - Top Left (irregular shape via borderRadius variations) */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob1,
          {
            transform: [
              { translateY: blob1TranslateY },
              { scale: blob1Scale },
              { rotate: '18deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(88, 28, 135, 0.7)', 'rgba(76, 29, 149, 0.4)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Blob 2: Magenta/Pink - Right Side */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob2,
          {
            transform: [
              { translateX: blob2TranslateX },
              { translateY: blob2TranslateY },
              { rotate: '-12deg' },
              { scale: 1.15 },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(219, 39, 119, 0.6)', 'rgba(192, 38, 211, 0.3)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Blob 3: Deep Blue - Bottom Left */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob3,
          {
            transform: [
              { scale: blob3Scale },
              { rotate: blob3Rotate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(30, 58, 138, 0.65)', 'rgba(37, 99, 235, 0.3)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Blob 4: Violet - Center */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob4,
          {
            transform: [
              { translateX: blob4TranslateX },
              { scale: blob4Scale },
              { rotate: '8deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.55)', 'rgba(124, 58, 237, 0.25)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Blob 5: Pink Accent - Top Right */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob5,
          {
            transform: [
              { translateY: blob5TranslateY },
              { scale: blob5Scale },
              { rotate: '-25deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.5)', 'rgba(219, 39, 119, 0.25)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Blob 6: Purple Mid - Center Left */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob6,
          {
            transform: [
              { translateX: blob6TranslateX },
              { rotate: blob6Rotate },
              { scale: 1.1 },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(147, 51, 234, 0.45)', 'rgba(126, 34, 206, 0.2)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Blob 7: Deep Indigo - Bottom Right */}
      <Animated.View
        style={[
          styles.blob,
          styles.blob7,
          {
            transform: [
              { scale: blob7Scale },
              { translateY: blob7TranslateY },
              { rotate: '15deg' },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(67, 56, 202, 0.6)', 'rgba(55, 48, 163, 0.3)', 'transparent']}
          style={styles.gradientFill}
        />
      </Animated.View>

      {/* Heavy blur layer to create the Suno effect */}
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Subtle noise/grain overlay */}
      <View style={styles.noiseOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    opacity: 0.75,
  },
  gradientFill: {
    flex: 1,
    borderRadius: 999,
  },
  // Irregular blob shapes (not perfect circles)
  blob1: {
    width: width * 1.8,
    height: width * 1.6,
    top: -width * 0.6,
    left: -width * 0.7,
    borderRadius: width * 0.9,
  },
  blob2: {
    width: width * 1.5,
    height: width * 1.7,
    top: height * 0.15,
    right: -width * 0.65,
    borderRadius: width * 0.85,
  },
  blob3: {
    width: width * 1.9,
    height: width * 1.5,
    bottom: -width * 0.7,
    left: -width * 0.5,
    borderRadius: width * 0.95,
  },
  blob4: {
    width: width * 1.3,
    height: width * 1.4,
    top: height * 0.4,
    left: width * 0.1,
    borderRadius: width * 0.7,
  },
  blob5: {
    width: width * 1.4,
    height: width * 1.2,
    top: -width * 0.4,
    right: -width * 0.4,
    borderRadius: width * 0.75,
    opacity: 0.65,
  },
  blob6: {
    width: width * 1.6,
    height: width * 1.3,
    top: height * 0.35,
    left: -width * 0.6,
    borderRadius: width * 0.8,
    opacity: 0.7,
  },
  blob7: {
    width: width * 1.7,
    height: width * 1.5,
    bottom: -width * 0.5,
    right: -width * 0.55,
    borderRadius: width * 0.88,
    opacity: 0.68,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    opacity: 0.08,
  },
});
