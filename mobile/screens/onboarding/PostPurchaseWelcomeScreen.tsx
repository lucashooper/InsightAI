import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ONBOARDING_SURFACE } from '../../constants/onboardingTheme';
import { sf } from '../../utils/responsive';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');

export default function PostPurchaseWelcomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dark = isDarkTheme(theme.name);

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
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={insightLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={[styles.title, dark && { color: '#ffffff' }]}>
          {t('onboarding.postPurchase.title')}
        </Text>
        <Text style={styles.subtitle}>{t('onboarding.postPurchase.subtitle')}</Text>

        <View style={styles.features}>
          {features.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={20} color="rgba(255,255,255,0.8)" />
              </View>
              <Text style={[styles.featureText, dark && { color: '#ffffff' }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.infoText, dark && { color: 'rgba(255, 255, 255, 0.45)' }]}>
          {t('onboarding.postPurchase.accountInfo')}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.continueText}>{t('common.continue')}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    marginBottom: 32,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -1.28,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: sf(18),
    fontWeight: '600',
    color: '#C4B5FD',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    gap: 16,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ONBOARDING_SURFACE.iconChip,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ONBOARDING_SURFACE.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: sf(16),
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
    textAlign: 'left',
  },
  infoText: {
    fontSize: sf(14),
    color: 'rgba(0, 0, 0, 0.45)',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueText: {
    fontSize: sf(17),
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
