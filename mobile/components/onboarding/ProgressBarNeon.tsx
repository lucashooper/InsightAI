import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ProgressBarNeonProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Premium neon-style progress bar with purple glow and animated width expansion
 * Gradient from pink → purple with smooth transitions
 */
export default function ProgressBarNeon({ currentStep, totalSteps }: ProgressBarNeonProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetProgress = (currentStep / totalSteps) * 100;
    
    Animated.spring(progressAnim, {
      toValue: targetProgress,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [currentStep, totalSteps]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fillContainer, { width: progressWidth }]}>
          <LinearGradient
            colors={['#ec4899', '#a855f7', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
          {/* Neon glow effect */}
          <View style={styles.glow} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  fillContainer: {
    height: '100%',
    position: 'relative',
  },
  fill: {
    flex: 1,
    borderRadius: 999,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    bottom: -2,
    borderRadius: 999,
    backgroundColor: 'transparent',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
