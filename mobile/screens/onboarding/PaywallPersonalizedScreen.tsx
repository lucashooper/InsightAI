import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrePaywallLayout from '../../components/onboarding/PrePaywallLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZENO_MAIN_PHONE_FULL } from '../../constants/phoneMockups';
import { getFirstName, getGoalFocusKey } from '../../utils/paywallPersonalization';
import { isTablet, sf } from '../../utils/responsive';

export default function PaywallPersonalizedScreen({ navigation }: any) {
  const { userName, onboardingAnswers } = useOnboarding();
  const { t } = useLanguage();
  const firstName = getFirstName(userName);
  const goalKey = getGoalFocusKey(onboardingAnswers);

  const title = firstName
    ? t('onboarding.prePaywall.personalized.titleNamed', { name: firstName })
    : t('onboarding.prePaywall.personalized.titleGeneric');

  return (
    <PrePaywallLayout
      step={0}
      onContinue={() => navigation.navigate('PaywallBenefits')}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={36} color="#ffffff" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {t(`onboarding.prePaywall.personalized.focus.${goalKey}`)}
      </Text>

      <View style={styles.phoneWrap}>
        <Image source={ZENO_MAIN_PHONE_FULL} style={styles.phone} resizeMode="contain" />
      </View>

      <Text style={styles.footerNote}>{t('onboarding.prePaywall.personalized.ready')}</Text>
    </PrePaywallLayout>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: sf(28),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: sf(36),
    marginBottom: 12,
  },
  subtitle: {
    fontSize: sf(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: sf(24),
    marginBottom: isTablet ? 28 : 20,
    paddingHorizontal: 8,
  },
  phoneWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  phone: {
    width: isTablet ? 260 : 220,
    height: isTablet ? 460 : 390,
  },
  footerNote: {
    fontSize: sf(14),
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: sf(20),
  },
});
