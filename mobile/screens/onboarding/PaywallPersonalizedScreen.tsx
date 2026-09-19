import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import CloudMascot from '../../components/companion/CloudMascot';
import PlanReadyCard, { type PlanNode } from '../../components/onboarding/PlanReadyCard';
import PaywallOfferBlock from '../../components/onboarding/PaywallOfferBlock';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFirstName, getGoalFocusKey } from '../../utils/paywallPersonalization';
import { isTablet, sf, iPadContentStyle } from '../../utils/responsive';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { safeGoBack } from '../../utils/navigationSafety';

const PLAN_NODES: PlanNode[] = [
  { color: '#FF8A65', label: 'Plan Focus', value: 'Find Inner Clarity', icon: 'search' },
  { color: '#AB7BFF', label: 'Coaching Style', value: 'Deeper Reflection', icon: 'chatbubble' },
  { color: '#F4C15D', label: 'Growth Area', value: 'Realign Your Path', icon: 'flash' },
  { color: '#F48FB1', label: 'Future Feeling', value: 'Feel Steady and Clear', icon: 'sparkles' },
];

const PREMIUM_FEATURES = [
  { color: '#F48FB1', icon: 'brush-outline' as const, titleKey: 'plan', bodyKey: 'plan' },
  { color: '#AB7BFF', icon: 'sparkles-outline' as const, titleKey: 'insights', bodyKey: 'insights' },
  { color: '#F4C15D', icon: 'bar-chart-outline' as const, titleKey: 'mood', bodyKey: 'mood' },
  { color: '#7EB8FF', icon: 'mic-outline' as const, titleKey: 'conversations', bodyKey: 'conversations' },
  { color: '#FF8A65', icon: 'book-outline' as const, titleKey: 'coaching', bodyKey: 'coaching' },
];

export default function PaywallPersonalizedScreen({ navigation, route }: any) {
  const { userName, onboardingAnswers } = useOnboarding();
  const { t } = useLanguage();
  const bottomInset = useOnboardingBottomInset();
  const firstName = getFirstName(userName);
  const goalKey = getGoalFocusKey(onboardingAnswers);

  const title = firstName
    ? t('onboarding.prePaywall.scroll.titleNamed', { name: firstName })
    : t('onboarding.prePaywall.scroll.titleGeneric');

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />
      <StatusBar barStyle="dark-content" />

      <OnboardingBackButton style={styles.backButton} onPress={() => safeGoBack(navigation)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, iPadContentStyle as object, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>
          {t(`onboarding.prePaywall.personalized.focus.${goalKey}`)}
        </Text>

        <PlanReadyCard nodes={PLAN_NODES} />

        <View style={styles.mascotSection}>
          <CloudMascot size={isTablet ? 148 : 128} valence={0.72} expression="curious" animated shadow={false} glow={false} />
          <Text style={styles.mascotCaption}>{t('onboarding.prePaywall.scroll.mascotCaption')}</Text>
        </View>

        <Text style={styles.unlockTitle}>
          {t('onboarding.prePaywall.scroll.unlockPrefix')}{' '}
          <Text style={styles.unlockAccent}>{t('onboarding.prePaywall.scroll.unlockAccent')}</Text>
        </Text>

        <View style={styles.featureList}>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f.titleKey} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color }]}>
                <Ionicons name={f.icon} size={20} color="#1a1a2e" />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>
                  {t(`onboarding.prePaywall.scroll.features.${f.titleKey}.title`)}
                </Text>
                <Text style={styles.featureBody}>
                  {t(`onboarding.prePaywall.scroll.features.${f.bodyKey}.body`)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.testimonialCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name="star" size={18} color="#fbbf24" />
            ))}
          </View>
          <Text style={styles.testimonialQuote}>
            "{t('onboarding.prePaywall.testimonial.quote')}"
          </Text>
          <Text style={styles.testimonialAuthor}>{t('onboarding.prePaywall.testimonial.author')}</Text>
        </View>

        <PaywallOfferBlock navigation={navigation} route={route} layout="stack" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    top: isTablet ? 60 : 50,
    left: 24,
    zIndex: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: isTablet ? 108 : 96,
    gap: 4,
  },
  heroTitle: {
    fontSize: sf(30),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: sf(38),
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: sf(16),
    color: ONBOARDING_TEXT.body,
    textAlign: 'center',
    lineHeight: sf(24),
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  mascotSection: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 8,
    position: 'relative',
  },
  mascotCaption: {
    marginTop: 12,
    fontSize: sf(15),
    color: ONBOARDING_TEXT.body,
    textAlign: 'center',
    lineHeight: sf(22),
    maxWidth: 300,
  },
  unlockTitle: {
    fontSize: sf(26),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: sf(34),
    marginTop: 20,
    marginBottom: 20,
  },
  unlockAccent: {
    color: '#8B9CF7',
  },
  featureList: {
    gap: 16,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: sf(16),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    marginBottom: 2,
  },
  featureBody: {
    fontSize: sf(14),
    color: ONBOARDING_TEXT.body,
    lineHeight: sf(20),
  },
  testimonialCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    padding: 22,
    marginBottom: 28,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 14,
  },
  testimonialQuote: {
    fontSize: sf(17),
    fontWeight: '700',
    color: ONBOARDING_TEXT.primary,
    textAlign: 'center',
    lineHeight: sf(26),
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: sf(13),
    color: ONBOARDING_TEXT.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
