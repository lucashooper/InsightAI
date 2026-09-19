import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import OnboardingSkipLink from '../../components/onboarding/OnboardingSkipLink';
import CloudMascot from '../../components/companion/CloudMascot';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, iPadWideContentStyle } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { safeGoBack } from '../../utils/navigationSafety';

const MASCOT = isTablet ? 168 : 142;

export default function PersonalityQuizIntroScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);
  const answers = route?.params?.answers || {};
  const returnIndex = route?.params?.returnIndex || 0;
  const mascotScale = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    analytics.trackOnboardingScreen('personality_quiz_intro', 'viewed', userName || undefined);
    Animated.spring(mascotScale, {
      toValue: 1,
      damping: 16,
      stiffness: 170,
      mass: 0.85,
      useNativeDriver: true,
    }).start();
  }, [mascotScale, userName]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.trackOnboardingScreen('personality_quiz_intro', 'completed', userName || undefined);
    navigation.push('OnboardingQuestion', { answers, startIndex: returnIndex });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.trackOnboardingScreen('personality_quiz_intro', 'skipped', userName || undefined);
    navigation.navigate('Analyzing', { answers, skipPersonality: true });
  };

  const stats = [
    { value: '10', label: t('onboarding.quizIntro.questions') },
    { value: '2', label: t('onboarding.quizIntro.minutes') },
    { value: t('onboarding.quizIntro.private'), label: '' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <OnboardingAmbientBackground />

      <OnboardingBackButton
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          safeGoBack(navigation, 'ProductReveal');
        }}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.heroWrap, { transform: [{ scale: mascotScale }] }]}>
          <CloudMascot size={MASCOT} valence={0.86} animated shadow />
        </Animated.View>

        <Text style={[styles.title, { color: dark ? '#fff' : '#1a1a2e' }]}>
          {t('onboarding.quizIntro.title')}
        </Text>
        <Text style={[styles.description, { color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)' }]}>
          {t('onboarding.quizIntro.description')}
        </Text>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.value + stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.label ? <Text style={styles.statLabel}>{stat.label}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color="#1a1a2e" />
            <Text style={styles.benefitText}>{t('onboarding.quizIntro.accurateInsights')}</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color="#1a1a2e" />
            <Text style={styles.benefitText}>{t('onboarding.quizIntro.recommendations')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <OnboardingButton label={t('common.continue')} onPress={handleContinue} />
        <OnboardingSkipLink label={t('onboarding.skipForNow')} onPress={handleSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: isTablet ? 72 : 56,
    ...iPadWideContentStyle,
  },
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: sf(28),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1.1,
  },
  description: {
    fontSize: sf(16),
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 360,
    marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderRadius: 20,
    paddingVertical: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: sf(18),
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.4,
  },
  statLabel: {
    marginTop: 2,
    fontSize: sf(12),
    color: 'rgba(26,26,46,0.55)',
    fontWeight: '500',
  },
  benefitsContainer: {
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
    maxWidth: isTablet ? 420 : undefined,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: sf(15),
    fontWeight: '500',
    color: 'rgba(26,26,46,0.72)',
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: isTablet ? 60 : 50,
    width: '100%',
  },
});
