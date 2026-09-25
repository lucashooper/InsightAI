import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EffortLevel } from '../../utils/effortLevel';
import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  effortLevel: EffortLevel;
  compact?: boolean;
};

const BADGE_STYLES: Record<
  EffortLevel,
  { bg: string; border: string; text: string; emoji: string }
> = {
  quick_win: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    text: '#047857',
    emoji: '⚡',
  },
  mindset_shift: {
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.35)',
    text: '#6d28d9',
    emoji: '🌱',
  },
  deep_routine: {
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.35)',
    text: '#4338ca',
    emoji: '🧘',
  },
};

export default function EffortLevelBadge({ effortLevel, compact }: Props) {
  const { t } = useLanguage();
  const style = BADGE_STYLES[effortLevel];
  const labelKey =
    effortLevel === 'quick_win'
      ? 'entry.effortQuickWin'
      : effortLevel === 'mindset_shift'
        ? 'entry.effortMindset'
        : 'entry.effortDeepRoutine';

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}
    >
      <Text style={[styles.text, { color: style.text }]}>
        {style.emoji} {t(labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
