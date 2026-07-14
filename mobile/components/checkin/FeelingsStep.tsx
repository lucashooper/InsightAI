import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';
import { useCheckInFlow } from './CheckInFlowProvider';
import PremiumButton from '../shared/PremiumButton';
import { FEELINGS_BY_TIER, MOOD_TINTS } from './wordBanks';
import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  onContinue: () => void;
};

const VISIBLE_COUNT = 12;
const wordKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '_');

export default function FeelingsStep({ onContinue }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { draft, toggleFeeling, addCustomFeeling } = useCheckInFlow();
  const [expanded, setExpanded] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const tint = MOOD_TINTS[draft.moodTier];
  const isDark = isDarkTheme(theme.name);
  const unselectedBackground = isDark ? theme.colors.surface : 'rgba(255,255,255,0.62)';
  const allFeelings = FEELINGS_BY_TIER[draft.moodTier];
  const visible = useMemo(
    () => (expanded ? allFeelings : allFeelings.slice(0, VISIBLE_COUNT)),
    [expanded, allFeelings],
  );

  const customFeelings = draft.feelings.filter((f) => !allFeelings.includes(f));

  const commitCustomFeeling = () => {
    const trimmed = customText.trim();
    if (trimmed) {
      addCustomFeeling(trimmed);
      setCustomText('');
    }
    setShowCustomInput(false);
  };

  const openCustomInput = () => {
    setShowCustomInput(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: theme.colors.primaryText }]}>
          {t('checkIn.feelingsQuestion', { mood: t(`checkIn.${draft.moodTier}`).toLowerCase() })}
        </Text>
      </View>
      <Text style={[styles.sub, { color: theme.colors.secondaryText }]}>{t('checkIn.chooseAll')}</Text>

      <View style={styles.grid}>
        {visible.map((feeling) => {
          const selected = draft.feelings.includes(feeling);
          return (
            <TouchableOpacity
              key={feeling}
              style={[
                styles.chip,
                {
                  borderColor: selected ? tint.accent : theme.colors.border,
                  backgroundColor: selected ? tint.chip : unselectedBackground,
                },
              ]}
              onPress={() => toggleFeeling(feeling)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? (isDark ? '#FFFFFF' : theme.colors.primaryText) : theme.colors.secondaryText },
                ]}
              >
                {t(`checkIn.words.${wordKey(feeling)}`)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {customFeelings.map((feeling) => {
          const selected = draft.feelings.includes(feeling);
          return (
            <TouchableOpacity
              key={`custom-${feeling}`}
              style={[
                styles.chip,
                {
                  borderColor: selected ? tint.accent : theme.colors.border,
                  backgroundColor: selected ? tint.chip : unselectedBackground,
                },
              ]}
              onPress={() => toggleFeeling(feeling)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? (isDark ? '#FFFFFF' : theme.colors.primaryText) : theme.colors.secondaryText },
                ]}
              >
                {feeling}
              </Text>
            </TouchableOpacity>
          );
        })}

        {showCustomInput ? (
          <View
            style={[
              styles.chip,
              styles.customInputChip,
              {
                borderColor: tint.accent,
                backgroundColor: tint.chip,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.customInput, { color: theme.colors.primaryText }]}
              placeholder={t('checkIn.customFeeling')}
              placeholderTextColor={theme.colors.tertiaryText}
              value={customText}
              onChangeText={setCustomText}
              onSubmitEditing={commitCustomFeeling}
              onBlur={commitCustomFeeling}
              returnKeyType="done"
              maxLength={32}
              autoCapitalize="words"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.chip,
              styles.addChip,
              { borderColor: theme.colors.border, backgroundColor: unselectedBackground },
            ]}
            onPress={openCustomInput}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={18} color={tint.accent} />
          </TouchableOpacity>
        )}
      </View>

      {allFeelings.length > VISIBLE_COUNT && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <Text style={[styles.showMore, { color: tint.accent }]}>
            {expanded ? t('common.showLess') : t('common.showMore')}
          </Text>
        </TouchableOpacity>
      )}

      <PremiumButton label={t('checkIn.continue')} onPress={onContinue} style={styles.cta} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  headingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  accentWord: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  sub: {
    fontSize: 15,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  addChip: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  customInputChip: {
    minWidth: 130,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  customInput: {
    fontSize: 15,
    fontWeight: '500',
    minWidth: 100,
    padding: 0,
  },
  showMore: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  cta: {
    marginTop: 8,
  },
});
