import React from 'react';
import { StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface AnimatedSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

/**
 * Slider wrapper without janky animations
 * Direct value updates for smooth interaction
 */
export default function AnimatedSlider({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  minimumTrackTintColor = 'transparent',
  maximumTrackTintColor = 'transparent',
  thumbTintColor = '#ffffff',
  style,
}: AnimatedSliderProps) {
  return (
    <Slider
      value={value}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      onValueChange={onValueChange}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      style={[styles.slider, style]}
    />
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 48,
  },
});
