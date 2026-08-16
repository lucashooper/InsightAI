import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const DEFAULT_EMOJIS = ['✨', '💪', '🏃', '👥', '🧘', '😴', '🎯', '🌟', '💡', '🔥', '🌈', '🎨', '📚', '🌱', '☕', '💝', '🌸', '📈', '💭', '🍃', '🥗', '🎵'];

type Props = {
  value: string;
  onChange: (emoji: string) => void;
  emojis?: string[];
  previewCount?: number;
};

export default function CollapsibleEmojiPicker({
  value,
  onChange,
  emojis = DEFAULT_EMOJIS,
  previewCount = 6,
}: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = isDarkTheme(theme.name);
  const [expanded, setExpanded] = useState(false);
  const preview = emojis.slice(0, previewCount);
  const visible = expanded ? emojis : preview;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {visible.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.option,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderColor: value === emoji ? '#8b5cf6' : 'transparent',
              },
              value === emoji && styles.optionActive,
            ]}
            onPress={() => onChange(emoji)}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {emojis.length > previewCount ? (
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, { color: isDark ? '#c4b5fd' : '#7c3aed' }]}>
            {expanded ? t('common.showLess') : t('auxiliary.playbook.moreEmojis')}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={isDark ? '#c4b5fd' : '#7c3aed'}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  optionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
  },
  emoji: {
    fontSize: 22,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
