import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import CachedImage from '../../components/shared/CachedImage';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { ONBOARDING_LIGHT, ONBOARDING_TEXT } from '../../constants/onboardingTheme';
import { sf } from '../../utils/responsive';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { analytics } from '../../services/analytics';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import { ONBOARDING_LAYOUT } from '../../constants/onboardingLayout';
import { iPadContentStyle } from '../../utils/responsive';

interface NotificationsOnboardingScreenProps {
  navigation: any;
}

export default function NotificationsOnboardingScreen({ navigation }: NotificationsOnboardingScreenProps) {
  const { userName } = useOnboarding();
  const { t } = useLanguage();

  React.useEffect(() => {
    analytics.trackOnboardingScreen('notifications', 'viewed', userName || undefined);
  }, []);

  const handleAllowNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('[Notifications] Permission status:', status);
      analytics.trackOnboardingScreen('notifications', 'completed', userName || undefined);
      navigation.navigate('RateUs');
    } catch (error) {
      console.error('[Notifications] Error requesting permissions:', error);
      analytics.trackOnboardingScreen('notifications', 'completed', userName || undefined);
      navigation.navigate('RateUs');
    }
  };

  const handleSkip = async () => {
    analytics.trackOnboardingScreen('notifications', 'skipped', userName || undefined);
    navigation.navigate('RateUs');
  };

  return (
    <View style={styles.container}>
      <OnboardingAmbientBackground />

      {navigation.canGoBack() && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={[styles.backArrowCircle, { backgroundColor: ONBOARDING_LIGHT.backCircleBg, borderColor: ONBOARDING_LIGHT.backCircleBorder, borderWidth: 1 }]}>
            <Ionicons name="arrow-back" size={ONBOARDING_LAYOUT.backIconSize} color={ONBOARDING_LIGHT.backIcon} />
          </View>
        </TouchableOpacity>
      )}

      <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="notifications-logo" />

      <View style={[styles.body, iPadContentStyle as any]}>
        <Text style={[styles.title, { color: ONBOARDING_TEXT.primary }]}>{t('onboarding.notifications.title')}</Text>
        <Text style={[styles.subtitle, { color: ONBOARDING_TEXT.body }]}>
          {t('onboarding.notifications.subtitle')}
        </Text>

        <View style={styles.footer}>
          <OnboardingButton
            label={t('onboarding.notifications.allow')}
            onPress={handleAllowNotifications}
          />
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: ONBOARDING_LIGHT.skipText }]}>{t('onboarding.notifications.skip')}</Text>
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
  },
  logo: {
    width: ONBOARDING_LAYOUT.logoSize,
    height: ONBOARDING_LAYOUT.logoSize,
    opacity: 0.9,
    position: 'absolute',
    top: ONBOARDING_LAYOUT.logoTop,
    alignSelf: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: ONBOARDING_LAYOUT.contentHorizontal,
    paddingTop: ONBOARDING_LAYOUT.contentTop + 30,
    paddingBottom: ONBOARDING_LAYOUT.footerBottom,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: sf(32),
    fontWeight: '600',
    marginBottom: 16,
    marginTop: ONBOARDING_LAYOUT.logoContentOffset,
    textAlign: 'center',
    letterSpacing: -1.28,
    lineHeight: sf(40),
    width: '100%',
  },
  subtitle: {
    fontSize: sf(16),
    marginBottom: ONBOARDING_LAYOUT.subtitleGap,
    textAlign: 'center',
    lineHeight: sf(24),
    width: '100%',
  },
  footer: {
    width: '100%',
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: sf(15),
    textAlign: 'center',
  },
});
