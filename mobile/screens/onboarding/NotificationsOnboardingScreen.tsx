import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import OnboardingAmbientBackground from '../../components/onboarding/OnboardingAmbientBackground';
import OnboardingButton from '../../components/onboarding/OnboardingButton';
import OnboardingBackButton from '../../components/onboarding/OnboardingBackButton';
import OnboardingSkipLink from '../../components/onboarding/OnboardingSkipLink';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';
import { ONBOARDING_TEXT, ONBOARDING_TYPE } from '../../constants/onboardingTheme';
import { analytics } from '../../services/analytics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { safeGoBack } from '../../utils/navigationSafety';

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
        <OnboardingBackButton onPress={() => safeGoBack(navigation)} />
      )}

      <View style={styles.mainContent}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 48,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  ctaWrap: {
    width: '100%',
    marginBottom: 16,
  },
});
