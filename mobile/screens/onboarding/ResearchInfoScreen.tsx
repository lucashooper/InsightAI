import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useLanguage } from '../../contexts/LanguageContext';

const meditationLottie = require('../../public/animations/Stress Management.json');

export default function ResearchInfoScreen({ navigation }: any) {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <SunoGradient />

      {/* Back Button - only show if can go back */}
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#6b7280" />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <LottieView
              source={meditationLottie}
              autoPlay
              loop
              style={styles.illustration}
            />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{t('onboarding.research.title')}</Text>

          {/* Body text */}
          <Text style={styles.bodyText}>
            {t('onboarding.research.body')}
          </Text>

          {/* Citation */}
          <Text style={styles.citation}>{t('onboarding.research.citation')}</Text>

          {/* Learn more link */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL('https://www.cambridge.org/core/journals/advances-in-psychiatric-treatment/article/emotional-and-physical-health-benefits-of-expressive-writing/ED2976A61F5DE56B46F07A1CE9EA9F9F');
            }}
            style={styles.learnMoreButton}
          >
            <Text style={styles.learnMoreText}>{t('onboarding.research.learnMore')}</Text>
            <Ionicons name="arrow-forward" size={16} color="#8b5cf6" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('OnboardingQuestion');
          }}
        >
          <View style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7f2',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
    paddingTop: 110,
  },
  mainContent: {
    alignItems: 'flex-start',
  },
  illustrationContainer: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  illustration: {
    width: 340,
    height: 340,
  },
  headline: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -1.2,
    lineHeight: 48,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  citation: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.35)',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  learnMoreText: {
    fontSize: 15,
    color: '#8B5CF6',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 50,
    paddingTop: 16,
  },
  button: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 22,
    borderRadius: 28,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
