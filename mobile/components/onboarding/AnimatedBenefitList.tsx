import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sf } from '../../utils/responsive';

type Props = {
  items: string[];
  light?: boolean;
};

export default function AnimatedBenefitList({ items, light }: Props) {
  const didAnimate = useRef(false);
  const anims = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (didAnimate.current) return;
    didAnimate.current = true;
    Animated.stagger(
      120,
      anims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
      ),
    ).start();
  }, [anims]);

  return (
    <View style={styles.list}>
      {items.map((text, index) => (
        <Animated.View
          key={text}
          style={[
            styles.item,
            {
              opacity: anims[index],
              transform: [
                {
                  translateY: anims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={[styles.text, light && styles.textLight]}>{text}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: sf(16),
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  textLight: {
    color: '#1a1a2e',
  },
});
