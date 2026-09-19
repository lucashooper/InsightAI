import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sf } from '../../utils/responsive';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';

export type PlanNode = {
  color: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  nodes: PlanNode[];
};

export default function PlanReadyCard({ nodes }: Props) {
  return (
    <View style={styles.card}>
      {nodes.map((node, i) => (
        <View key={node.label} style={styles.row}>
          <View style={styles.rail}>
            <View style={[styles.iconBubble, { backgroundColor: node.color }]}>
              <Ionicons name={node.icon} size={18} color="#fff" />
            </View>
            {i < nodes.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.copy}>
            <Text style={styles.label}>{node.label}</Text>
            <Text style={styles.value}>{node.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: 'rgba(80, 60, 140, 0.18)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 6,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    minHeight: 58,
  },
  rail: {
    width: 44,
    alignItems: 'center',
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(123, 94, 167, 0.18)',
    marginVertical: 4,
    borderRadius: 1,
  },
  copy: {
    flex: 1,
    paddingLeft: 6,
    paddingBottom: 10,
    justifyContent: 'center',
  },
  label: {
    fontSize: sf(12),
    color: ONBOARDING_TEXT.secondary,
    fontWeight: '500',
  },
  value: {
    fontSize: sf(17),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    marginTop: 2,
    letterSpacing: -0.3,
  },
});
