import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InsightCompanionMark from '../companion/InsightCompanionMark';
import { sf } from '../../utils/responsive';

type Props = {
  promptText: string;
  isDark?: boolean;
};

/** Premium prompt header for guided journal entries — no raw bracket tags. */
export default function InsightPromptHeader({ promptText, isDark = true }: Props) {
  return (
    <LinearGradient
      colors={[
        'rgba(139, 92, 246, 0.45)',
        'rgba(99, 102, 241, 0.28)',
        'rgba(139, 92, 246, 0.18)',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.border}
    >
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.badgeRow}>
          <InsightCompanionMark size={22} isDark={isDark} />
          <Text style={[styles.badgeLabel, isDark ? styles.badgeDark : styles.badgeLight]}>
            Insight Prompt
          </Text>
        </View>
        <Text style={[styles.question, isDark ? styles.questionDark : styles.questionLight]}>
          {promptText}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  border: {
    borderRadius: 16,
    padding: 1.5,
    marginBottom: 16,
  },
  card: {
    borderRadius: 14.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardDark: {
    backgroundColor: 'rgba(18, 16, 42, 0.92)',
  },
  cardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  badgeLabel: {
    fontSize: sf(12),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  badgeDark: {
    color: 'rgba(167, 139, 250, 0.95)',
  },
  badgeLight: {
    color: '#7c3aed',
  },
  question: {
    fontSize: sf(14),
    fontWeight: '700',
    lineHeight: sf(22),
    letterSpacing: -0.15,
  },
  questionDark: {
    color: 'rgba(255, 255, 255, 0.94)',
  },
  questionLight: {
    color: '#1a1a2e',
  },
});
