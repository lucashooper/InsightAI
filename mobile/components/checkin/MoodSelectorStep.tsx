import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { draft, setMoodScore } = useCheckInFlow();
  const tint = MOOD_TINTS[draft.moodTier];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Text style={[styles.heading, { color: theme.colors.primaryText }]}>
        How do you feel right now?
      </Text>

      <View style={styles.iconArea}>
        <MoodIcon tier={draft.moodTier} size={184} />
      </View>

      <Text style={[styles.moodLabel, { color: tint.accent }]}>{draft.moodLabel}</Text>

      <View style={styles.sliderBlock}>
        <MoodSlider score={draft.moodScore} accent={tint.accent} onScoreChange={setMoodScore} />
      </View>

      <PremiumButton label="Continue" onPress={onContinue} large style={styles.cta} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: S.sm,
    paddingBottom: S.xxl,
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
    marginBottom: S.xxxl,
  },
  cta: {
    marginTop: S.sm,
  },
});
