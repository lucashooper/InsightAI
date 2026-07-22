import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import SunoGradient from '../../components/onboarding/SunoGradient';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTablet, iPadContentStyle, sf } from '../../utils/responsive';

const insightLogo = require('../../public/Insight-Logo-nobg.webp');
const lockIcon = require('../../public/onboarding-icons/LockIcon2.webp');

// Preload icons to prevent janky late-loading
Asset.fromModule(insightLogo).downloadAsync();
Asset.fromModule(lockIcon).downloadAsync();

const { width } = Dimensions.get('window');

interface PrivacyOnboardingScreenProps {
  navigation: any;
}

export default function PrivacyOnboardingScreen({ navigation }: PrivacyOnboardingScreenProps) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();

  useEffect(() => {
    analytics.trackOnboardingScreen('privacy', 'viewed', userName || undefined);
  }, []);
  
  const handleContinue = () => {
    analytics.trackOnboardingScreen('privacy', 'completed', userName || undefined);
    navigation.navigate('ValueProp');
  };

  return (
    <View style={styles.container}>
      <SunoGradient themeColors={theme.colors.backgroundGradient as string[]} />
      
      {/* Back Button - Circular style matching other onboarding pages */}
      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="arrow-back" size={20} color={isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e'} />
          </View>
        </TouchableOpacity>
      )}

      {/* Logo */}
      <Image source={insightLogo} style={styles.logo} />
      
      <View style={styles.mainContent}>
        {/* Lock Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={lockIcon}
            style={styles.lockIcon}
            resizeMode="contain"
          />
        </View>

        {/* Content below lock icon */}
        <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>{t('onboarding.privacy.title')}</Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
          {t('onboarding.privacy.subtitle')}
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={[styles.feature, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.5)', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
            <Text style={[styles.featureText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>{t('onboarding.privacy.encryption')}</Text>
          </View>
          <View style={[styles.feature, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.5)', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <Ionicons name="key" size={24} color="#8b5cf6" />
            <Text style={[styles.featureText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>{t('onboarding.privacy.passwordKey')}</Text>
          </View>
          <View style={[styles.feature, { backgroundColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.5)', borderColor: isDarkTheme(theme.name) ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <Ionicons name="eye-off" size={24} color="#8b5cf6" />
            <Text style={[styles.featureText, { color: isDarkTheme(theme.name) ? '#ffffff' : '#1a1a2e' }]}>{t('onboarding.privacy.cannotRead')}</Text>
          </View>
        </View>
      </View>
      </View>

      {/* Continue Button */}
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
    paddingHorizontal: isTablet ? 40 : 24,
    paddingTop: isTablet ? 116 : 140,
    alignItems: 'center',
    paddingBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
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
    paddingTop: isTablet ? 6 : 18,
    ...iPadContentStyle,
  },
  iconContainer: {
    marginBottom: isTablet ? 10 : -8,
    marginTop: 0,
  },
  lockIcon: {
    width: isTablet ? 250 : 196,
    height: isTablet ? 250 : 196,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: isTablet ? sf(32) + 8 : 40,
  },
  subtitle: {
    fontSize: sf(16),
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: isTablet ? 40 : 32,
    textAlign: 'center',
    lineHeight: isTablet ? sf(18) + 8 : 24,
    paddingHorizontal: isTablet ? 36 : 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: isTablet ? 36 : 28,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 18 : 12,
    paddingHorizontal: isTablet ? 24 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: isTablet ? 16 : 12,
    marginBottom: isTablet ? 14 : 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    minHeight: isTablet ? 76 : undefined,
  },
  featureText: {
    fontSize: sf(16),
    color: '#1a1a2e',
    marginLeft: 16,
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    maxWidth: isTablet ? 820 : undefined,
    paddingVertical: 22,
    backgroundColor: '#1a1a1a',
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
  skipText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
});
