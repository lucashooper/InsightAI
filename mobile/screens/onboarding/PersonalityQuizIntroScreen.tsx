import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { isTablet, sf, iPadWideContentStyle } from '../../utils/responsive';
import Svg, { Circle } from 'react-native-svg';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

const bookIcon = require('../../public/Book-Icon-Insight.webp');

const { width } = Dimensions.get('window');

// Decorative floating blossoms (similar to Liven design)
const DecorativeBlossoms = ({ dark }: { dark: boolean }) => {
  const blossom1Anim = useRef(new Animated.Value(0)).current;
  const blossom2Anim = useRef(new Animated.Value(0)).current;
  const blossom3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation for blossoms
    const createFloatAnimation = (anim: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createFloatAnimation(blossom1Anim, 3000, 0),
      createFloatAnimation(blossom2Anim, 4000, 500),
      createFloatAnimation(blossom3Anim, 3500, 1000),
    ]).start();
  }, []);

  const translateY1 = blossom1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const translateY2 = blossom2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const translateY3 = blossom3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const blossomColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(139,92,246,0.2)';

  return (
    <Svg width={width} height={400} style={styles.blossomsContainer}>
      {/* Top right cluster */}
      <Animated.View style={{ transform: [{ translateY: translateY1 }] }}>
        <Circle cx={width * 0.85} cy={50} r={6} fill={blossomColor} />
        <Circle cx={width * 0.9} cy={45} r={5} fill={blossomColor} />
        <Circle cx={width * 0.88} cy={60} r={4} fill={blossomColor} />
        <Circle cx={width * 0.93} cy={55} r={5} fill={blossomColor} />
        <Circle cx={width * 0.95} cy={70} r={6} fill={blossomColor} />
      </Animated.View>

      {/* Top left cluster */}
      <Animated.View style={{ transform: [{ translateY: translateY2 }] }}>
        <Circle cx={width * 0.1} cy={80} r={5} fill={blossomColor} />
        <Circle cx={width * 0.08} cy={95} r={4} fill={blossomColor} />
        <Circle cx={width * 0.15} cy={90} r={5} fill={blossomColor} />
      </Animated.View>

      {/* Right side cluster */}
      <Animated.View style={{ transform: [{ translateY: translateY3 }] }}>
        <Circle cx={width * 0.92} cy={150} r={5} fill={blossomColor} />
        <Circle cx={width * 0.88} cy={165} r={6} fill={blossomColor} />
        <Circle cx={width * 0.95} cy={160} r={4} fill={blossomColor} />
      </Animated.View>
    </Svg>
  );
};

export default function PersonalityQuizIntroScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);
  const neutralAccent = dark ? 'rgba(255,255,255,0.94)' : '#1a1a2e';
  const neutralSubtle = dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.6)';
  const answers = route?.params?.answers || {};
  const returnIndex = route?.params?.returnIndex || 0;

  useEffect(() => {
    analytics.trackOnboardingScreen('personality_quiz_intro', 'viewed', userName || undefined);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.trackOnboardingScreen('personality_quiz_intro', 'completed', userName || undefined);
    // Continue to psychology questions at the returnIndex
    navigation.navigate('OnboardingQuestion', { answers, startIndex: returnIndex });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.trackOnboardingScreen('personality_quiz_intro', 'skipped', userName || undefined);
    // Skip psychology questions, go straight to analysis without personality result
    navigation.navigate('Analyzing', { answers, skipPersonality: true });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={false} />
      <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />

      {/* Decorative Blossoms */}
      <DecorativeBlossoms dark={dark} />

      {/* Back Button */}
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
        {/* Icon - No container, just the book icon */}
        <View style={styles.iconContainer}>
          <Image source={bookIcon} style={styles.bookIconLarge} resizeMode="contain" />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: dark ? '#fff' : '#1a1a2e' }]}>
          {t('onboarding.quizIntro.title')}
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
          {t('onboarding.quizIntro.description')}
        </Text>

        {/* Info Cards - Glassmorphic style */}
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

        {/* Benefits */}
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

      {/* Bottom Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.9}
          onPress={handleContinue}
        >
          <View style={styles.continueGradient}>
            <Text style={styles.continueText}>{t('common.continue')}</Text>
          </View>
        </TouchableOpacity>

        {/* Skip Button */}
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
  blossomsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backButton: {
    position: 'absolute',
    top: isTablet ? 60 : 50,
    left: 20,
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
    paddingHorizontal: isTablet ? 48 : 32,
    paddingTop: isTablet ? 92 : 72,
    ...iPadWideContentStyle,
  },
  iconContainer: {
    marginBottom: isTablet ? 8 : -4,
  },
  bookIconLarge: {
    width: isTablet ? 280 : 220,
    height: isTablet ? 280 : 220,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    letterSpacing: -0.6,
  },
  description: {
    fontSize: sf(16),
    textAlign: 'center',
    lineHeight: sf(24),
    marginBottom: isTablet ? 28 : 20,
    paddingHorizontal: isTablet ? 56 : 16,
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
    paddingHorizontal: isTablet ? 48 : 24,
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
