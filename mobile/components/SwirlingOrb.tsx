import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SwirlingOrbProps {
  size?: number;
  colors?: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  children?: React.ReactNode;
}

const SwirlingOrb: React.FC<SwirlingOrbProps> = ({ 
  size = 240, 
  colors = {
    primary: ['rgba(139, 92, 246, 0.9)', 'rgba(168, 85, 247, 0.7)'],
    secondary: ['rgba(59, 130, 246, 0.9)', 'rgba(29, 78, 216, 0.8)'],
    accent: ['rgba(236, 72, 153, 0.8)', 'rgba(192, 132, 252, 0.6)']
  },
  children 
}) => {
  // Animation values for rotating gradient layers
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;
  const rotation3 = useRef(new Animated.Value(0)).current;
  const rotation4 = useRef(new Animated.Value(0)).current;
  const rotation5 = useRef(new Animated.Value(0)).current;
  const rotation6 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animations
    const createRotation = (animValue: Animated.Value, duration: number) => 
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );

    const animations = [
      createRotation(rotation1, 25000),
      createRotation(rotation2, 30000),
      createRotation(rotation3, 35000),
      createRotation(rotation4, 28000),
      createRotation(rotation5, 32000),
      createRotation(rotation6, 27000),
    ];

    // Subtle pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    animations.forEach(anim => anim.start());
    pulseAnimation.start();

    return () => {
      animations.forEach(anim => anim.stop());
      pulseAnimation.stop();
    };
  }, []);

  const createSpin = (rotation: Animated.Value) => 
    rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          transform: [{ scale: pulseAnim }]
        }
      ]}
    >
      {/* Glow effect background */}
      <View style={[styles.glowContainer, { width: size * 1.3, height: size * 1.3, borderRadius: size * 0.65 }]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.2)', 'transparent']}
          style={[styles.glow, { borderRadius: size * 0.65 }]}
        />
      </View>

      {/* Base orb */}
      <View style={[styles.baseOrb, { width: size, height: size, borderRadius: size / 2 }]}>
        <LinearGradient
          colors={['rgba(20, 20, 30, 0.95)', 'rgba(30, 30, 50, 0.9)']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
        />
      </View>

      {/* Layer 1: Primary swirl */}
      <Animated.View 
        style={[
          styles.layer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            transform: [{ rotate: createSpin(rotation1) }],
            opacity: 0.6,
          }
        ]}
      >
        <LinearGradient
          colors={[...colors.primary, 'transparent']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Layer 2: Secondary swirl */}
      <Animated.View 
        style={[
          styles.layer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            transform: [{ rotate: createSpin(rotation2) }],
            opacity: 0.5,
          }
        ]}
      >
        <LinearGradient
          colors={[...colors.secondary, 'transparent']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Layer 3: Accent swirl */}
      <Animated.View 
        style={[
          styles.layer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            transform: [{ rotate: createSpin(rotation3) }],
            opacity: 0.4,
          }
        ]}
      >
        <LinearGradient
          colors={[...colors.accent, 'transparent']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      {/* Layer 4: Radial blend */}
      <Animated.View 
        style={[
          styles.layer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            transform: [{ rotate: createSpin(rotation4) }],
            opacity: 0.35,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.6)', 'rgba(59, 130, 246, 0.5)', 'transparent']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>

      {/* Layer 5: Shimmer */}
      <Animated.View 
        style={[
          styles.layer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            transform: [{ rotate: createSpin(rotation5) }],
            opacity: 0.25,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'rgba(168, 85, 247, 0.3)', 'transparent']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Layer 6: Final blend */}
      <Animated.View 
        style={[
          styles.layer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            transform: [{ rotate: createSpin(rotation6) }],
            opacity: 0.3,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.5)', 'rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.3)']}
          style={[styles.gradientView, { borderRadius: size / 2 }]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
        />
      </Animated.View>

      {/* Content layer */}
      <View style={styles.contentLayer}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: '100%',
    height: '100%',
  },
  baseOrb: {
    position: 'absolute',
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  gradientView: {
    width: '100%',
    height: '100%',
  },
  contentLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default SwirlingOrb;
