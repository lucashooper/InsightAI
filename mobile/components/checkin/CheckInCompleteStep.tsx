import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isDarkTheme, useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PremiumButton from '../shared/PremiumButton';
import MoodIcon from './MoodIcon';
import { CheckInDraft } from './types';
import { MOOD_TINTS } from './wordBanks';
import { sf } from '../../utils/responsive';

type Props = {
  draft: CheckInDraft;
  onAddJournal: () => void;
  onDone: () => void;
};

export default function CheckInCompleteStep({ draft, onAddJournal, onDone }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = isDarkTheme(theme.name);
  const tint = MOOD_TINTS[draft.moodTier];
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, { opacity }]}>
        <Animated.View style={[styles.checkWrap, { transform: [{ scale }] }]}>
          <View style={[styles.checkCircle, { backgroundColor: `${tint.accent}22`, borderColor: tint.accent }]}>
            <Ionicons name="checkmark" size={42} color={tint.accent} />
          </View>
        </Animated.View>

        <View style={styles.moodRow}>
          <MoodIcon tier={draft.moodTier} size={32} />
          <Text style={[styles.title, { color: theme.colors.primaryText }]}>
            {t('checkIn.savedTitle')}
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
          {t('checkIn.savedSubtitle')}
        </Text>

        <View style={styles.actionsRow}>
          <PremiumButton
            label={t('checkIn.addJournalNotes')}
            onPress={onAddJournal}
            block
            large
            style={styles.actionBtn}
          />
          <PremiumButton
            label={t('checkIn.doneForNow')}
            onPress={onDone}
            variant="secondary"
            block
            large
            style={[
              styles.actionBtn,
              styles.secondaryBtn,
              {
                backgroundColor: isDark ? theme.colors.surface : 'rgba(255,255,255,0.72)',
                borderColor: theme.colors.border,
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
  },
  checkWrap: {
    marginBottom: 28,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: sf(26),
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: sf(16),
    lineHeight: sf(24),
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 28,
  },
  actionsRow: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    alignSelf: 'stretch',
  },
  secondaryBtn: {
    borderWidth: 1,
  },
});
