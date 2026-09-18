import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import OnboardingSkipLink from '../../components/onboarding/OnboardingSkipLink';
import CloudMascot from '../../components/companion/CloudMascot';
import { JOURNEY_UNITS } from '../../data/journeyUnits';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, iPadWideContentStyle } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { safeGoBack } from '../../utils/navigationSafety';

const ORB_SIZE = 110;
const FEATURE_CARDS = [
  { unitId: 'thoughts', title: 'Know Your Worth', meta: '3 Min · Easy', copy: 'Feeling worthy from within' },
  { unitId: 'emotions', title: 'Find Your Focus', meta: '5 Min · Medium', copy: 'Where your energy goes' },
  { unitId: 'habits', title: 'Find Your Rhythm', meta: '5 Min · Medium', copy: 'A steadier everyday pace' },
  { unitId: 'self-compassion', title: 'Turn Entries into Insights', meta: '7 Min · Easy', copy: 'Patterns you can actually use' },
];

export default function PersonalityQuizIntroScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);
  const neutralAccent = dark ? 'rgba(255,255,255,0.94)' : '#1a1a2e';
  const answers = route?.params?.answers || {};
  const returnIndex = route?.params?.returnIndex || 0;
  const mascotScale = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    analytics.trackOnboardingScreen('personality_quiz_intro', 'viewed', userName || undefined);
    Animated.spring(mascotScale, {
      toValue: 1,
      damping: 15,
      stiffness: 180,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [mascotScale, userName]);

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
      <StatusBar barStyle="dark-content" />
      <OnboardingAmbientBackground />

      <OnboardingBackButton
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Resumed onboarding lands here with no history — fall back to the welcome screen.
          safeGoBack(navigation, 'ProductReveal');
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroWrap, { transform: [{ scale: mascotScale }] }]}>
          <CloudMascot size={ORB_SIZE} personality="default" valence={0.78} shadow />
        </Animated.View>

        <Text style={[styles.title, { color: dark ? '#fff' : '#1a1a2e' }]}>
          {t('onboarding.quizIntro.title')}
        </Text>

        <Text style={[styles.description, { color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
          {t('onboarding.quizIntro.description')}
        </Text>

        <View style={styles.featureGrid}>
          {FEATURE_CARDS.map((card) => {
            const unit = JOURNEY_UNITS.find((item) => item.id === card.unitId);
            return (
              <LinearGradient
                key={card.unitId}
                colors={unit?.colors ?? ['#E8F0FF', '#FCE8F0']}
                start={{ x: 0.05, y: 0 }}
                end={{ x: 0.95, y: 1 }}
                style={styles.featureCard}
              >
                {unit?.art ? (
                  <Image source={unit.art} style={styles.featureArt} contentFit="contain" />
                ) : null}
                <Text style={styles.featureMeta}>{card.meta}</Text>
                <Text style={styles.featureTitle}>{card.title}</Text>
                <Text style={styles.featureCopy}>{card.copy}</Text>
              </LinearGradient>
            );
          })}
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={neutralAccent} />
            <Text style={[styles.benefitText, { color: dark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.72)' }]}>
              {t('onboarding.quizIntro.accurateInsights')}
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={neutralAccent} />
            <Text style={[styles.benefitText, { color: dark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.72)' }]}>
              {t('onboarding.quizIntro.recommendations')}
            </Text>
          </View>
        </View>
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: isTablet ? 88 : 68,
    paddingBottom: 16,
    ...iPadWideContentStyle,
  },
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    width: ORB_SIZE,
    height: ORB_SIZE,
  },
  title: {
    fontSize: sf(28),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 8,
    letterSpacing: -1.1,
  },
  description: {
    fontSize: sf(15),
    textAlign: 'center',
    lineHeight: sf(22),
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  featureCard: {
    width: '47%',
    flexGrow: 1,
    minHeight: isTablet ? 168 : 148,
    borderRadius: 24,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: 'rgba(80, 70, 120, 0.16)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  featureArt: {
    position: 'absolute',
    right: -8,
    top: -6,
    width: 92,
    height: 92,
    opacity: 0.92,
  },
  featureMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(26,26,46,0.62)',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.3,
  },
  featureCopy: {
    fontSize: 12,
    color: 'rgba(26,26,46,0.7)',
    marginTop: 2,
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
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: isTablet ? 60 : 50,
    width: '100%',
  },
});
