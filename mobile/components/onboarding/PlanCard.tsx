import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  weeklyEquivalent?: string;
  badge?: string;
  selected: boolean;
  popular?: boolean;
  onPress: () => void;
}

/**
 * Premium plan card for paywall screen
 * Modeled after SEED app with glowing borders and selection states
 */
export default function PlanCard({
  title,
  price,
  period,
  weeklyEquivalent,
  badge,
  selected,
  popular,
  onPress,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, selected && styles.containerSelected]}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <LinearGradient
        colors={
          selected
            ? ['rgba(139, 92, 246, 0.15)', 'rgba(124, 58, 237, 0.1)']
            : ['rgba(15, 23, 42, 0.8)', 'rgba(30, 41, 59, 0.6)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          popular && styles.cardPopular,
          selected && styles.cardSelected,
        ]}
      >
        {selected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.period}>/{period}</Text>
          </View>

          {weeklyEquivalent && (
            <Text style={styles.weeklyEquivalent}>{weeklyEquivalent}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  containerSelected: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    position: 'relative',
  },
  cardPopular: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 5,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  period: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
    marginLeft: 4,
  },
  weeklyEquivalent: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
});
