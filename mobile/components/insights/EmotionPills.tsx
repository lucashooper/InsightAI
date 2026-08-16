import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sf } from '../../utils/responsive';
import { getMoodIndicator } from '../../utils/moodIndicators';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateEmotion } from '../../i18n/labels';

type Props = {
  /** Raw emotion keys from AI analysis (English) */
  emotions: string[];
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function EmotionPills({ emotions }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = isDarkTheme(theme.name);

  const unique = [...new Set(emotions.map((e) => e.trim()).filter(Boolean))].slice(0, 4);
  if (unique.length === 0) return null;

  return (
    <View style={styles.row}>
      {unique.map((emotion) => {
        const indicator = getMoodIndicator({ mood_analysis: { primary_emotion: emotion } });
        const accent = indicator?.color ?? '#6b7280';
        const bg = hexToRgba(accent, isDark ? 0.28 : 0.16);
        const label = translateEmotion(t, emotion);
        const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);

        return (
          <View key={emotion} style={[styles.pill, { backgroundColor: bg }]}>
            <Text style={styles.emoji}>{indicator?.emoji ?? '💭'}</Text>
            <Text style={[styles.label, { color: theme.colors.primaryText }]} numberOfLines={1}>
              {displayLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 0,
  },
  emoji: {
    fontSize: sf(14),
  },
  label: {
    fontSize: sf(13),
    fontWeight: '700',
    flexShrink: 1,
  },
});
