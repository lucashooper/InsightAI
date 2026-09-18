import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCheckInFlow } from './CheckInFlowProvider';
import MoodIcon from './MoodIcon';
import MoodSlider from './MoodSlider';
import PillButton from '../ui/PillButton';
import CloudMascot, { MOOD_TINT_COLORS } from '../companion/CloudMascot';
import { INK, TYPO } from '../../constants/typography';
import { isTablet } from '../../utils/responsive';
import { MOOD_STOPS, type MoodTier } from './types';
import * as Haptics from 'expo-haptics';

type Props = {
  onContinue: () => void;
};

const ORB_LABEL: Record<MoodTier, string> = {
  terrible: 'Terrible',
  struggling: 'Bad',
  neutral: 'Fine',
  good: 'Good',
  amazing: 'Great',
};

export default function MoodSelectorStep({ onContinue }: Props) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { draft, setMoodScore } = useCheckInFlow();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>{t('checkIn.howDoYouFeel')}</Text>

      <View style={styles.mascotArea}>
        <MoodIcon tier={draft.moodTier} size={isTablet ? 220 : 176} />
      </View>

      <Text style={styles.moodLabel}>{t(`checkIn.${draft.moodTier}`)}</Text>

      <View style={styles.orbRow}>
        {MOOD_STOPS.map((stop) => (
          <MoodOrb
            key={stop.tier}
            tier={stop.tier}
            label={ORB_LABEL[stop.tier]}
            selected={draft.moodTier === stop.tier}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMoodScore(stop.score);
            }}
          />
        ))}
      </View>

      <View style={styles.sliderBlock}>
        <MoodSlider score={draft.moodScore} accent={INK.primary} onScoreChange={setMoodScore} />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 32 : 16) + 8 }]}>
        <PillButton label={t('checkIn.continue')} onPress={onContinue} block />
      </View>
    </View>
  );
}

function MoodOrb({
  tier,
  label,
  selected,
  onPress,
}: {
  tier: MoodTier;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const bounce = useSharedValue(0);
  const scale = useSharedValue(selected ? 1.14 : 1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.14 : 1, { damping: 14 });
    bounce.value = selected
      ? withRepeat(withSequence(withTiming(-4, { duration: 520 }), withTiming(0, { duration: 520 })), -1, true)
      : withTiming(0, { duration: 180 });
  }, [selected, bounce, scale]);

  const glow = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: bounce.value }],
    shadowOpacity: selected ? 0.5 : 0.12,
  }));

  return (
    <Pressable onPress={onPress} style={styles.orbHit}>
      <Animated.View
        style={[
          styles.orbWrap,
          { shadowColor: MOOD_TINT_COLORS[tier] },
          glow,
        ]}
      >
        <CloudMascot size={52} tint={MOOD_TINT_COLORS[tier]} valence={{ terrible: 0, struggling: 0.25, neutral: 0.5, good: 0.8, amazing: 1 }[tier]} variant="orb" shadow={false} animated={selected} />
      </Animated.View>
      <Text style={[styles.orbLabel, selected && styles.orbLabelOn]}>{label}</Text>
    </Pressable>
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
    marginBottom: 16,
  },
  orbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  orbHit: {
    alignItems: 'center',
    width: 56,
  },
  orbWrap: {
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  orbLabel: {
    marginTop: 6,
    fontSize: 11,
    color: INK.secondary,
  },
  orbLabelOn: {
    color: INK.primary,
    fontWeight: '600',
  },
  sliderBlock: {
    marginBottom: 12,
  },
  footer: {
    paddingTop: 16,
  },
});
