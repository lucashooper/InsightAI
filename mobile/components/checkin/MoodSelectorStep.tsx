import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCheckInFlow } from './CheckInFlowProvider';
import MoodIcon from './MoodIcon';
import MoodSlider from './MoodSlider';
import PillButton from '../ui/PillButton';
import { INK, TYPO } from '../../constants/typography';
import { isTablet } from '../../utils/responsive';

type Props = {
  onContinue: () => void;
};

/**
 * Mood step — question, the mascot reacting live, the label, the slider, one
 * CTA. Laid out as a fixed column (no scroll) so nothing can drift off the
 * bottom edge; the mascot takes whatever room is left.
 */
export default function MoodSelectorStep({ onContinue }: Props) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { draft, setMoodScore } = useCheckInFlow();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>{t('checkIn.howDoYouFeel')}</Text>

      <View style={styles.mascotArea}>
        <MoodIcon tier={draft.moodTier} size={isTablet ? 260 : 212} />
      </View>

      <Text style={styles.moodLabel}>{t(`checkIn.${draft.moodTier}`)}</Text>

      <View style={styles.sliderBlock}>
        <MoodSlider score={draft.moodScore} accent={INK.primary} onScoreChange={setMoodScore} />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 32 : 16) + 8 }]}>
        <PillButton label={t('checkIn.continue')} onPress={onContinue} block />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heading: {
    ...TYPO.h2,
    color: INK.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  mascotArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  moodLabel: {
    ...TYPO.h1,
    color: INK.primary,
    textAlign: 'center',
    marginBottom: 28,
  },
  sliderBlock: {
    marginBottom: 12,
  },
  footer: {
    paddingTop: 16,
  },
});
