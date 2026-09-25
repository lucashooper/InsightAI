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

const HERO_MOOD_SIZE = isTablet ? 264 : 211;

export default function MoodSelectorStep({ onContinue }: Props) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { draft, setMoodScore } = useCheckInFlow();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>{t('checkIn.howDoYouFeel')}</Text>

      <View style={styles.mascotArea}>
        <MoodIcon tier={draft.moodTier} size={HERO_MOOD_SIZE} />
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
    ...TYPO.heading,
    color: INK.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  mascotArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    overflow: 'visible',
  },
  moodLabel: {
    ...TYPO.display,
    color: INK.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  sliderBlock: {
    marginBottom: 12,
  },
  footer: {
    paddingTop: 16,
  },
});
