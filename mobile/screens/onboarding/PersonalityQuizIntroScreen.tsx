import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import { OrbSlot } from '../../components/companion/OrbOverlayProvider';
import { isTablet, sf, si, ss, screenPadding, iPadContentStyle, iPadWideContentStyle } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';

const ORB_SIZE = isTablet ? 130 : 110;

export default function PersonalityQuizIntroScreen({ navigation, route }: any) {
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const answers = route?.params?.answers || {};
  const returnIndex = route?.params?.returnIndex || 0;

  useEffect(() => {
    analytics.trackOnboardingScreen('personality_quiz_intro', 'viewed', userName || undefined);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.trackOnboardingScreen('personality_quiz_intro', 'completed', userName || undefined);
    navigation.navigate('OnboardingQuestion', { answers, startIndex: returnIndex });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.trackOnboardingScreen('personality_quiz_intro', 'skipped', userName || undefined);
    navigation.navigate('Analyzing', { answers, skipPersonality: true });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      <OnboardingAmbientBackground />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
      >
        <View style={styles.backArrowCircle}>
          <Ionicons name="arrow-back" size={si(20)} color={ONBOARDING_TEXT.primary} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.heroWrap}>
          <OrbSlot size={ORB_SIZE} personality="default" />
        </View>

        <Text style={styles.title}>{t('onboarding.quizIntro.title')}</Text>

        <Text style={styles.description}>{t('onboarding.quizIntro.description')}</Text>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>10</Text>
              <Text style={styles.cardLabel}>{t('onboarding.quizIntro.questions')}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardNumber}>2</Text>
              <Text style={styles.cardLabel}>{t('onboarding.quizIntro.minutes')}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Ionicons name="lock-closed" size={si(28)} color={ONBOARDING_TEXT.primary} />
              <Text style={styles.cardLabel}>{t('onboarding.quizIntro.private')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={si(20)} color={ONBOARDING_TEXT.primary} />
            <Text style={styles.benefitText}>{t('onboarding.quizIntro.accurateInsights')}</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={si(20)} color={ONBOARDING_TEXT.primary} />
            <Text style={styles.benefitText}>{t('onboarding.quizIntro.recommendations')}</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={si(20)} color={ONBOARDING_TEXT.primary} />
            <Text style={styles.benefitText}>{t('onboarding.quizIntro.patternTracking')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={handleContinue}
        >
          <View style={styles.continueGradient}>
            <Text style={styles.continueText}>{t('common.continue')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.7}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>{t('onboarding.skipForNow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: screenPadding,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    borderRadius: isTablet ? 22 : 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(200, 185, 255, 0.35)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: screenPadding,
    paddingTop: isTablet ? 88 : 68,
    ...iPadWideContentStyle,
  },
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ss(24),
    marginBottom: ss(28),
    width: ORB_SIZE,
    height: ORB_SIZE,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 14,
    letterSpacing: -1.28,
    color: ONBOARDING_TEXT.primary,
  },
  description: {
    fontSize: sf(16),
    textAlign: 'center',
    lineHeight: sf(24),
    marginBottom: isTablet ? 28 : 20,
    paddingHorizontal: 8,
    color: ONBOARDING_TEXT.body,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: isTablet ? 18 : 12,
    marginBottom: isTablet ? 36 : 28,
    width: '100%',
    justifyContent: 'center',
    maxWidth: isTablet ? 560 : undefined,
  },
  card: {
    width: isTablet ? 160 : 100,
    minHeight: isTablet ? 154 : undefined,
    paddingVertical: isTablet ? 24 : 20,
    paddingHorizontal: isTablet ? 16 : 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: isTablet ? 8 : 4,
    width: '100%',
    minHeight: isTablet ? 100 : undefined,
  },
  cardNumber: {
    fontSize: sf(28),
    fontWeight: '800',
    lineHeight: sf(32),
    color: ONBOARDING_TEXT.primary,
  },
  cardLabel: {
    fontSize: sf(13),
    fontWeight: '500',
    lineHeight: sf(16),
    textAlign: 'center',
    color: ONBOARDING_TEXT.body,
  },
  benefitsContainer: {
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
    marginBottom: 28,
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
    color: ONBOARDING_TEXT.body,
  },
  buttonsContainer: {
    paddingHorizontal: screenPadding,
    paddingTop: 8,
    paddingBottom: isTablet ? 60 : 50,
    width: '100%',
    ...iPadContentStyle,
  },
  continueButton: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#7B5EA7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  continueGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 28,
  },
  continueText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: sf(15),
    fontWeight: '500',
    color: ONBOARDING_TEXT.secondary,
  },
});
