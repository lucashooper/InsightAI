import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PillOptionProps {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Premium pill option with selection states:
 * - Default: low-opacity purple border
 * - Selected: green neon glow with checkmark
 * - Smooth transition animations
 */
export default function PillOption({ label, icon, selected, onPress }: PillOptionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      {selected ? (
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.pill, styles.pillSelected]}
        >
          <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.checkmark} />
          {icon && <Ionicons name={icon as any} size={20} color="#10b981" />}
          <Text style={[styles.label, styles.labelSelected]}>{label}</Text>
          <Ionicons name="chevron-forward" size={16} color="#10b981" />
        </LinearGradient>
      ) : (
        <Animated.View style={[styles.pill, styles.pillDefault]}>
          {icon && <Ionicons name={icon as any} size={20} color="#8b5cf6" />}
          <Text style={styles.label}>{label}</Text>
          <Ionicons name="chevron-forward" size={18} color="#6b7280" />
        </Animated.View>
      )}
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
  },
  pillDefault: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  pillSelected: {
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  checkmark: {
    marginRight: -4,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  labelSelected: {
    fontWeight: '700',
    color: '#10b981',
  },
});
