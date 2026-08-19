import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { isTablet, sf, ss, iPadContentStyle } from '../../utils/responsive';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import OnboardingSkipLink from '../../components/onboarding/OnboardingSkipLink';
import { ONBOARDING_TYPE } from '../../constants/onboardingTheme';
import { useLanguage } from '../../contexts/LanguageContext';

const testimonials = [
  { textKey: 'first' },
  { textKey: 'second' },
  { textKey: 'third' },
];

export default function RateUsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check if StoreReview is available
    const isAvailable = await StoreReview.isAvailableAsync();
    
    if (isAvailable) {
      // Request in-app review
      await StoreReview.requestReview();
    }
    
    // Navigate to next screen regardless
    navigation.navigate('PaywallPersonalized');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PaywallPersonalized');
  };

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />

      <OnboardingBackButton onPress={() => navigation.goBack()} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Row with Star */}
        <View style={styles.titleRow}>
          <Text style={styles.starIconSmall}>⭐</Text>
          <Text style={[styles.title, dark && styles.titleDark]}>{t('onboarding.rateUs.title')}</Text>
        </View>
        <Text style={[styles.subtitle, dark && styles.subtitleDark]}>
          {t('onboarding.rateUs.subtitle')}
        </Text>

        {/* Testimonials */}
        <View style={styles.testimonialsContainer}>
          {testimonials.map((testimonial, index) => (
            <View 
              key={index}
              style={[
                styles.testimonialCard,
                dark ? styles.testimonialCardDark : styles.testimonialCardLight
              ]}
            >
              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={styles.star}>⭐</Text>
                ))}
              </View>

              {/* Quote */}
              <Text style={[styles.testimonialText, dark && styles.testimonialTextDark]}>
                “{t(`onboarding.rateUs.testimonials.${testimonial.textKey}`)}”
              </Text>

              {/* Author */}
              <Text style={[styles.testimonialAuthor, dark && styles.testimonialAuthorDark]}>
                — {t(`onboarding.rateUs.authors.${testimonial.textKey}`)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: isTablet ? 48 : 24,
    paddingTop: isTablet ? 120 : 100,
    paddingBottom: isTablet ? 40 : 20,
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
    fontSize: isTablet ? 28 : 24,
  },
  title: {
    ...ONBOARDING_TYPE.title,
    color: '#1a1a2e',
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: sf(16),
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    marginBottom: isTablet ? 48 : 40,
    paddingHorizontal: isTablet ? 40 : 20,
    lineHeight: sf(22),
  },
  subtitleDark: {
    color: 'rgba(255, 255, 255, 0.7)',
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
  },
  testimonialCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testimonialCardLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    color: '#374151',
    lineHeight: sf(22),
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialTextDark: {
    color: '#ffffff',
  },
  testimonialAuthor: {
    fontSize: sf(14),
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '700',
  },
  testimonialAuthorDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footer: {
    width: '100%',
    paddingHorizontal: isTablet ? 48 : 24,
    paddingBottom: isTablet ? 70 : 50,
    alignItems: 'center',
    gap: 4,
    ...(iPadContentStyle as any),
  },
});
