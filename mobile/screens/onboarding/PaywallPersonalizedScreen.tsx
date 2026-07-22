import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrePaywallLayout from '../../components/onboarding/PrePaywallLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
        <Ionicons name="checkmark-circle" size={40} color="#ffffff" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {t(`onboarding.prePaywall.personalized.focus.${goalKey}`)}
      </Text>
    </PrePaywallLayout>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: 'center',
    marginBottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: sf(16),
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: sf(24),
    paddingHorizontal: 8,
  },
});
