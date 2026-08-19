import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import CachedImage from '../../components/shared/CachedImage';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import OnboardingSkipLink from '../../components/onboarding/OnboardingSkipLink';
import { INSIGHT_LOGO } from '../../constants/appAssets';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { ONBOARDING_TEXT, ONBOARDING_TYPE } from '../../constants/onboardingTheme';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface NotificationsOnboardingScreenProps {
  navigation: any;
}

export default function NotificationsOnboardingScreen({ navigation }: NotificationsOnboardingScreenProps) {
  const { theme } = useTheme();
  const { userName } = useOnboarding();
  const { t } = useLanguage();
  const isDark = isDarkTheme(theme.name);
  const titleColor = isDark ? '#ffffff' : ONBOARDING_TEXT.primary;
  const subtitleColor = isDark ? 'rgba(255,255,255,0.6)' : ONBOARDING_TEXT.secondary;

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
        <OnboardingBackButton onPress={() => navigation.goBack()} />
      )}

      <CachedImage source={INSIGHT_LOGO} style={styles.logo} contentFit="contain" recyclingKey="notifications-logo" />

      <Text style={[styles.title, ONBOARDING_TYPE.title, { color: titleColor }]}>
        {t('onboarding.notifications.title')}
      </Text>

      <Text style={[styles.subtitle, ONBOARDING_TYPE.subtitle, { color: subtitleColor }]}>
        {t('onboarding.notifications.subtitle')}
      </Text>

      <View style={styles.ctaWrap}>
        <OnboardingButton label={t('onboarding.notifications.allow')} onPress={handleAllowNotifications} />
      </View>

      <OnboardingSkipLink label={t('onboarding.notifications.skip')} onPress={handleSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 60,
    opacity: 0.9,
    position: 'absolute',
    top: 60,
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  subtitle: {
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  ctaWrap: {
    width: '100%',
    marginBottom: 16,
  },
});
