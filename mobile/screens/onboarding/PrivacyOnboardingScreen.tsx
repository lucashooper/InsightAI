import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, iPadContentStyle, sf } from '../../utils/responsive';
import { ONBOARDING_SURFACE } from '../../constants/onboardingTheme';

interface PrivacyOnboardingScreenProps {
  navigation: any;
}

export default function PrivacyOnboardingScreen({ navigation }: PrivacyOnboardingScreenProps) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);

  useEffect(() => {
    analytics.trackOnboardingScreen('privacy', 'viewed', userName || undefined);
  }, []);

  const handleContinue = () => {
    analytics.trackOnboardingScreen('privacy', 'completed', userName || undefined);
    navigation.navigate('ValueProp');
  };

  const features = [
    { icon: 'shield-checkmark-outline' as const, text: t('onboarding.privacy.encryption') },
    { icon: 'key-outline' as const, text: t('onboarding.privacy.passwordKey') },
    { icon: 'eye-off-outline' as const, text: t('onboarding.privacy.cannotRead') },
  ];

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />

      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="arrow-back" size={20} color={dark ? '#ffffff' : '#1a1a2e'} />
          </View>
        </TouchableOpacity>
      )}

      <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="privacy-logo" />

      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: dark ? '#ffffff' : '#1a1a2e' }]}>
          {t('onboarding.privacy.title')}
        </Text>

        <Text style={[styles.subtitle, { color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
          {t('onboarding.privacy.subtitle')}
        </Text>

        <View style={styles.featuresContainer}>
          {features.map((f) => (
            <View
              key={f.text}
              style={[
                styles.feature,
                {
                  backgroundColor: dark ? ONBOARDING_SURFACE.fillElevated : 'rgba(255, 255, 255, 0.5)',
                  borderColor: dark ? ONBOARDING_SURFACE.border : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              <View style={[styles.iconChip, { backgroundColor: dark ? ONBOARDING_SURFACE.iconChip : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name={f.icon} size={20} color={dark ? 'rgba(255,255,255,0.8)' : '#1a1a2e'} />
              </View>
              <Text style={[styles.featureText, { color: dark ? '#ffffff' : '#1a1a2e' }]}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: isTablet ? 116 : 140,
    alignItems: 'center',
    paddingBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
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
  logo: {
    width: isTablet ? 110 : 100,
    height: isTablet ? 110 : 100,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isTablet ? 72 : 88,
    ...iPadContentStyle,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1.28,
    lineHeight: isTablet ? sf(32) + 8 : 40,
  },
  subtitle: {
    fontSize: sf(16),
    marginBottom: isTablet ? 40 : 32,
    textAlign: 'center',
    lineHeight: isTablet ? sf(18) + 8 : 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: isTablet ? 36 : 28,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: 16,
    borderRadius: isTablet ? 16 : 14,
    marginBottom: isTablet ? 14 : 12,
    borderWidth: 1,
    minHeight: isTablet ? 76 : undefined,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: sf(16),
    marginLeft: 14,
    fontWeight: '500',
    flex: 1,
  },
  continueButton: {
    width: '100%',
    maxWidth: isTablet ? 820 : undefined,
    paddingVertical: 22,
    backgroundColor: '#7B5EA7',
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
