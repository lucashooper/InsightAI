import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_SURFACE, ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { ONBOARDING_LAYOUT } from '../../constants/onboardingLayout';
import { isTablet, sf, ss, si, iPadContentStyle } from '../../utils/responsive';
import { useOnboardingBottomInset } from '../../utils/onboardingInsets';

export default function PostPurchaseWelcomeScreen({ navigation }: any) {
  const { t } = useLanguage();
  const bottomInset = useOnboardingBottomInset();

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AuthSelection', { postPurchase: true });
  };

  const features = [
    { icon: 'sparkles-outline' as const, text: t('onboarding.postPurchase.analysis') },
    { icon: 'shield-checkmark-outline' as const, text: t('onboarding.postPurchase.privateEntries') },
    { icon: 'trending-up-outline' as const, text: t('onboarding.postPurchase.growth') },
  ];

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />
      <StatusBar barStyle="dark-content" />

      <View style={[styles.content, iPadContentStyle as any]}>
        <View style={styles.logoContainer}>
          <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="post-purchase-logo" />
        </View>

        <Text style={styles.title}>{t('onboarding.postPurchase.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.postPurchase.subtitle')}</Text>

        <View style={styles.features}>
          {features.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={si(20)} color="#7B5EA7" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.infoText}>{t('onboarding.postPurchase.accountInfo')}</Text>
      </View>

      <View style={[
        styles.footer,
        iPadContentStyle as any,
        { paddingBottom: Math.max(bottomInset, ONBOARDING_LAYOUT.footerBottom) },
      ]}>
        <OnboardingButton label={t('common.continue')} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: isTablet ? ONBOARDING_LAYOUT.contentTop : 80,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: ONBOARDING_LAYOUT.logoSize,
    height: ONBOARDING_LAYOUT.logoSize,
    marginBottom: isTablet ? ss(40) : 32,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    color: ONBOARDING_TEXT.primary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -1.28,
    lineHeight: sf(40),
  },
  subtitle: {
    fontSize: sf(18),
    fontWeight: '600',
    color: ONBOARDING_TEXT.secondary,
    textAlign: 'center',
    marginBottom: isTablet ? ss(48) : 40,
  },
  features: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: isTablet ? 520 : 320,
    gap: isTablet ? 20 : 16,
    marginBottom: isTablet ? ss(40) : 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ss(14),
  },
  featureIcon: {
    width: isTablet ? 52 : 44,
    height: isTablet ? 52 : 44,
    borderRadius: isTablet ? 16 : 14,
    backgroundColor: ONBOARDING_SURFACE.iconChip,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ONBOARDING_SURFACE.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: sf(16),
    fontWeight: '600',
    color: ONBOARDING_TEXT.body,
    flex: 1,
    textAlign: 'left',
  },
  infoText: {
    fontSize: sf(14),
    color: ONBOARDING_TEXT.secondary,
    textAlign: 'center',
    lineHeight: sf(22),
    maxWidth: isTablet ? 480 : 320,
  },
  footer: {
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: ONBOARDING_LAYOUT.footerTop,
    width: '100%',
  },
});
