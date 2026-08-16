import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const GREEN = '#22C55E';
const GREEN_DARK = '#10B981';

type Props = {
  completed: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
};

export default function ProtocolCompleteButton({ completed, onPress, size = 'md' }: Props) {
  const scale = useSharedValue(1);
  const dim = size === 'sm' ? 28 : 44;
  const iconSize = size === 'sm' ? 16 : 22;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.92, { duration: 50 }),
      withTiming(1, { duration: 100 }),
    );
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityState={{ checked: completed }}
    >
      <Animated.View
        style={[
          animStyle,
          styles.base,
          { width: dim, height: dim, borderRadius: dim / 2 },
          completed && styles.done,
        ]}
      >
        {completed ? (
          <Ionicons name="checkmark" size={iconSize} color="#fff" />
        ) : (
          <Ionicons name="checkmark" size={iconSize - 2} color="rgba(34, 197, 94, 0.5)" />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: GREEN,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    backgroundColor: GREEN,
    borderColor: GREEN_DARK,
  },
});
