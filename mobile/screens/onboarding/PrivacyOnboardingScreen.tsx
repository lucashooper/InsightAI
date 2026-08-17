import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, iPadContentStyle, sf, si } from '../../utils/responsive';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { ONBOARDING_LAYOUT } from '../../constants/onboardingLayout';

interface PrivacyOnboardingScreenProps {
  navigation: any;
}

export default function PrivacyOnboardingScreen({ navigation }: PrivacyOnboardingScreenProps) {
  const { userName } = useOnboarding();
  const { t } = useLanguage();

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
          <View style={styles.backArrowCircle}>
            <Ionicons name="arrow-back" size={si(20)} color={ONBOARDING_TEXT.primary} />
          </View>
        </TouchableOpacity>
      )}

      <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="privacy-logo" />

      <View style={styles.mainContent}>
        <Text style={styles.title}>{t('onboarding.privacy.title')}</Text>

        <Text style={styles.subtitle}>{t('onboarding.privacy.subtitle')}</Text>

        <View style={styles.featuresContainer}>
          {features.map((f) => (
            <View key={f.text} style={styles.feature}>
              <View style={styles.iconChip}>
                <Ionicons name={f.icon} size={si(20)} color={ONBOARDING_TEXT.primary} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, iPadContentStyle as any]}>
        <OnboardingButton label={t('common.continue')} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: ONBOARDING_LAYOUT.contentTop + 16,
    alignItems: 'center',
    paddingBottom: ONBOARDING_LAYOUT.footerBottom,
  },
  backButton: {
    position: 'absolute',
    top: ONBOARDING_LAYOUT.backTop,
    left: ONBOARDING_LAYOUT.backLeft,
    zIndex: 10,
    padding: 4,
  },
  backArrowCircle: {
    width: ONBOARDING_LAYOUT.backSize,
    height: ONBOARDING_LAYOUT.backSize,
    borderRadius: ONBOARDING_LAYOUT.backRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(200, 185, 255, 0.35)',
  },
  logo: {
    width: ONBOARDING_LAYOUT.logoSize,
    height: ONBOARDING_LAYOUT.logoSize,
    opacity: 0.9,
    position: 'absolute',
    top: ONBOARDING_LAYOUT.logoTop,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: ONBOARDING_LAYOUT.logoContentOffset,
    ...iPadContentStyle,
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1.28,
    lineHeight: isTablet ? sf(32) + 8 : 40,
    color: ONBOARDING_TEXT.primary,
  },
  subtitle: {
    fontSize: sf(16),
    marginBottom: isTablet ? 40 : 32,
    textAlign: 'center',
    lineHeight: isTablet ? sf(18) + 8 : 24,
    color: ONBOARDING_TEXT.body,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  iconChip: {
    width: isTablet ? 44 : 40,
    height: isTablet ? 44 : 40,
    borderRadius: isTablet ? 22 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  featureText: {
    fontSize: sf(16),
    marginLeft: 14,
    fontWeight: '500',
    flex: 1,
    color: ONBOARDING_TEXT.primary,
  },
  footer: {
    width: '100%',
    paddingTop: ONBOARDING_LAYOUT.footerTop,
  },
});
