import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCheckInFlow } from './CheckInFlowProvider';
import MoodIcon from './MoodIcon';
import MoodSlider from './MoodSlider';
import PremiumButton from '../shared/PremiumButton';
import { MOOD_TINTS } from './wordBanks';
import { THEME } from '../../constants/theme';

const S = THEME.spacing;

type Props = {
  onContinue: () => void;
};

export default function MoodSelectorStep({ onContinue }: Props) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { draft, setMoodScore } = useCheckInFlow();
  const tint = MOOD_TINTS[draft.moodTier];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={[styles.heading, { color: theme.colors.primaryText }]}>
          {t('checkIn.howDoYouFeel')}
        </Text>

        <View style={styles.iconArea}>
          <MoodIcon tier={draft.moodTier} size={184} />
        </View>

        <Text style={[styles.moodLabel, { color: tint.accent }]}>{t(`checkIn.${draft.moodTier}`)}</Text>

        <View style={styles.sliderBlock}>
          <MoodSlider score={draft.moodScore} accent={tint.accent} onScoreChange={setMoodScore} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 32 : 16) + 12 }]}>
        <PremiumButton label={t('checkIn.continue')} onPress={onContinue} large block />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: S.sm,
    paddingBottom: S.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: S.xl,
    letterSpacing: -0.3,
  },
  iconArea: {
    alignItems: 'center',
    marginBottom: S.xl,
  },
  moodLabel: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: S.xxl,
    letterSpacing: 0.5,
  },
  sliderBlock: {
    marginBottom: S.lg,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
