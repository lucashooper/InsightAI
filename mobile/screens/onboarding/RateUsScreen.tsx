import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { sf, screenPadding, iPadContentStyle } from '../../utils/responsive';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_LIGHT, ONBOARDING_TEXT } from '../../constants/onboardingTheme';

const testimonials = [
  { textKey: 'first' },
  { textKey: 'second' },
  { textKey: 'third' },
];

export default function RateUsScreen({ navigation }: any) {
  const { t } = useLanguage();

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
    }

    navigation.navigate('PaywallPersonalized');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PaywallPersonalized');
  };

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={[styles.backArrowCircle, { backgroundColor: ONBOARDING_LIGHT.backCircleBg, borderColor: ONBOARDING_LIGHT.backCircleBorder, borderWidth: 1 }]}>
          <Ionicons name="arrow-back" size={20} color={ONBOARDING_LIGHT.backIcon} />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, iPadContentStyle as any]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.starIconSmall}>⭐</Text>
          <Text style={styles.title}>{t('onboarding.rateUs.title')}</Text>
        </View>
        <Text style={styles.subtitle}>{t('onboarding.rateUs.subtitle')}</Text>

        <View style={styles.testimonialsContainer}>
          {testimonials.map((testimonial, index) => (
            <View key={index} style={styles.testimonialCard}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={styles.star}>⭐</Text>
                ))}
              </View>

              <Text style={styles.testimonialText}>
                "{t(`onboarding.rateUs.testimonials.${testimonial.textKey}`)}"
              </Text>

              <Text style={styles.testimonialAuthor}>
                — {t(`onboarding.rateUs.authors.${testimonial.textKey}`)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, iPadContentStyle as any]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
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
    top: 60,
    left: screenPadding,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: 100,
    paddingBottom: 20,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starIconSmall: {
    fontSize: sf(24),
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    color: ONBOARDING_TEXT.primary,
    letterSpacing: -1.28,
    lineHeight: sf(40),
  },
  subtitle: {
    fontSize: sf(16),
    color: ONBOARDING_TEXT.secondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: sf(22),
  },
  testimonialsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: 'rgba(200, 185, 255, 0.35)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  star: {
    fontSize: 16,
  },
  testimonialText: {
    fontSize: sf(15),
    color: ONBOARDING_TEXT.body,
    lineHeight: sf(22),
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontSize: sf(14),
    color: ONBOARDING_TEXT.secondary,
    fontWeight: '700',
  },
  footer: {
    width: '100%',
    paddingHorizontal: screenPadding,
    paddingBottom: 50,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#7B5EA7',
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: sf(15),
    color: ONBOARDING_TEXT.tertiary,
    textAlign: 'center',
  },
});
