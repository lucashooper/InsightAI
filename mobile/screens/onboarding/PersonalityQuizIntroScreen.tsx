import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, iPadWideContentStyle } from '../../utils/responsive';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

const miraOrb = require('../../public/Mira-Orb-No-Background.png');

export default function PersonalityQuizIntroScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);
  const neutralAccent = dark ? 'rgba(255,255,255,0.94)' : '#1a1a2e';
  const neutralSubtle = dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.6)';
  const answers = route?.params?.answers || {};
  const returnIndex = route?.params?.returnIndex || 0;

  const pulse = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    analytics.trackOnboardingScreen('personality_quiz_intro', 'viewed', userName || undefined);
  }, []);

  useEffect(() => {
    // Very slow, restrained breath — no aggressive motion
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.02,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const rotateLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 90000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    pulseLoop.start();
    rotateLoop.start();
    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [pulse, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={false} />
      <OnboardingAmbientBackground />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.goBack();
        }}
      >
        <View style={[styles.backArrowCircle, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <Ionicons name="arrow-back" size={20} color={dark ? '#fff' : '#1a1a2e'} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.heroWrap}>
          <Animated.View style={{ transform: [{ scale: pulse }, { rotate: spin }] }}>
            <Image source={miraOrb} style={styles.miraOrb} resizeMode="contain" />
          </Animated.View>
        </View>

        <Text style={[styles.title, { color: dark ? '#fff' : '#1a1a2e' }]}>
          {t('onboarding.quizIntro.title')}
        </Text>

        <Text style={[styles.description, { color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
          {t('onboarding.quizIntro.description')}
        </Text>

        <View style={styles.cardsContainer}>
          <View style={[styles.card, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)' }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardNumber, { color: neutralAccent }]}>10</Text>
              <Text style={[styles.cardLabel, { color: neutralSubtle }]}>{t('onboarding.quizIntro.questions')}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)' }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardNumber, { color: neutralAccent }]}>2</Text>
              <Text style={[styles.cardLabel, { color: neutralSubtle }]}>{t('onboarding.quizIntro.minutes')}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)' }]}>
            <View style={styles.cardContent}>
              <Ionicons name="lock-closed" size={28} color={neutralAccent} />
              <Text style={[styles.cardLabel, { color: neutralSubtle }]}>{t('onboarding.quizIntro.private')}</Text>
            </View>
          </View>
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
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={neutralAccent} />
            <Text style={[styles.benefitText, { color: dark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.72)' }]}>
              {t('onboarding.quizIntro.patternTracking')}
            </Text>
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
          <Text style={[styles.skipText, { color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
            {t('onboarding.skipForNow')}
          </Text>
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
    left: 24,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: isTablet ? 88 : 68,
    ...iPadWideContentStyle,
  },
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isTablet ? 12 : 4,
    width: isTablet ? 200 : 168,
    height: isTablet ? 200 : 168,
  },
  miraOrb: {
    width: isTablet ? 168 : 132,
    height: isTablet ? 168 : 132,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    letterSpacing: -1.28,
  },
  description: {
    fontSize: sf(16),
    textAlign: 'center',
    lineHeight: sf(24),
    marginBottom: isTablet ? 28 : 20,
    paddingHorizontal: 8,
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
  },
  cardLabel: {
    fontSize: sf(13),
    fontWeight: '500',
    lineHeight: sf(16),
    textAlign: 'center',
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
  continueButton: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
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
  },
});
