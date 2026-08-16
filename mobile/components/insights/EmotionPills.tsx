import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sf } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateEmotion } from '../../i18n/labels';
import { getEmotionPillStyle } from '../../utils/emotionPillStyles';

type Props = {
  /** Raw emotion keys from AI analysis (English) */
  emotions: string[];
};

export default function EmotionPills({ emotions }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = isDarkTheme(theme.name);

  const unique = [...new Set(emotions.map((e) => e.trim()).filter(Boolean))].slice(0, 4);
  if (unique.length === 0) return null;

  return (
    <View style={styles.row}>
      {unique.map((emotion) => {
        const pill = getEmotionPillStyle(emotion);
        const label = translateEmotion(t, emotion);
        const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);

        return (
          <View
            key={emotion}
            style={[
              styles.pill,
              {
                backgroundColor: isDark ? pill.darkBg : pill.lightBg,
                borderColor: isDark ? pill.darkBorder : pill.lightBorder,
              },
            ]}
          >
            <Text style={styles.emoji}>{pill.emoji}</Text>
            <Text
              style={[
                styles.label,
                { color: isDark ? pill.darkText : theme.colors.primaryText },
              ]}
              numberOfLines={1}
            >
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
    borderWidth: 1,
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
