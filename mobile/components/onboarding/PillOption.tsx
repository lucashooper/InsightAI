import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface PillOptionProps {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Premium pill option with Pushscroll-style selection:
 * - Default: subtle dark background with border
 * - Selected: bright cyan gradient fill, no text color change
 * - Smooth transition animations
 */
export default function PillOption({ label, icon, selected, onPress }: PillOptionProps) {
  const checkAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  }, [selected, checkAnim]);

  // Brand colors for social media icons - using official brand colors
  const getIconColor = () => {
    // Always use brand colors for social media icons
    switch (label) {
      case 'Instagram': return '#E4405F';
      case 'Facebook': return '#1877F2';
      case 'TikTok': return '#ffffff';
      case 'YouTube': return '#FF0000';
      case 'Google': return '#4285F4';
      default: return selected ? '#0b1220' : '#cbd5e1';
    }
  };

  const getIconBackgroundColor = () => {
    if (selected) return 'rgba(255,255,255,0.95)';
    
    switch (label) {
      case 'Instagram': return 'rgba(228, 64, 95, 0.15)';
      case 'Facebook': return 'rgba(24, 119, 242, 0.15)';
      case 'TikTok': return 'rgba(0, 0, 0, 0.8)';
      case 'YouTube': return 'rgba(255, 0, 0, 0.15)';
      case 'Google': return 'rgba(255, 255, 255, 0.9)';
      default: return 'rgba(255,255,255,0.08)';
    }
  };

  const selectedColors = ['#38bdf8', '#6366f1'] as const;
  const defaultColors = ['rgba(15, 23, 42, 0.55)', 'rgba(2, 6, 23, 0.45)'] as const;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.container}
    >
      <LinearGradient
        colors={selected ? selectedColors : defaultColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.pill, selected ? styles.pillSelected : styles.pillDefault]}
      >
        <View style={styles.leftGroup}>
          <Animated.View
            style={[
              styles.checkWrapper,
              {
                opacity: checkAnim,
                transform: [
                  {
                    scale: checkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.checkChip}>
              <Ionicons name="checkmark" size={14} color="#0b1220" />
            </View>
          </Animated.View>

          <View style={[styles.iconChip, { backgroundColor: getIconBackgroundColor() }]}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={18}
                color={getIconColor()}
              />
            )}
          </View>

          <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={selected ? '#e0f2fe' : '#94a3b8'}
        />

        <View pointerEvents="none" style={styles.insetOverlay} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
    overflow: 'hidden',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkWrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  iconChipSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  pillDefault: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  pillSelected: {
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.40)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  insetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    opacity: 0.5,
  },
  label: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  labelSelected: {
    color: '#ffffff',
  },
});
