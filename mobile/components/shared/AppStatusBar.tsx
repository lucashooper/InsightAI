import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { useTheme, isDarkTheme } from '../../contexts/ThemeContext';

/** Routes that always use a light background — status bar must stay dark-content. */
const LIGHT_BACKGROUND_ROUTES = new Set([
  'Welcome',
  'ProductReveal',
  'AuthSelection',
  'ChooseVibe',
  'OnboardingQuestion',
  'NotificationPermission',
  'PersonalityQuizIntro',
  'Analyzing',
  'InsightIntro',
  'MiraOnboardingChat',
  'PersonalityResult',
  'AnalysisComplete',
  'ValueProp',
  'ValuePropPatterns',
  'ValuePropWins',
  'RateUs',
  'PaywallPersonalized',
  'PaywallBenefits',
  'PaywallTestimonial',
  'Paywall',
  'PostPurchaseWelcome',
  'OnboardingSummary',
  'InteractiveShowcase',
  'PrivacyOnboarding',
  'NotificationsOnboarding',
  'Login',
  'Signup',
  'SignupUsername',
  'SignupEmail',
  'SignupPassword',
  'ForgotPassword',
]);

type Props = {
  routeName?: string | null;
};

/** Single source of truth for status bar style — respects theme and onboarding light screens. */
export default function AppStatusBar({ routeName = null }: Props) {
  const { theme } = useTheme();

  const forceDarkContent =
    routeName != null && LIGHT_BACKGROUND_ROUTES.has(routeName);
  const dark = isDarkTheme(theme.name);
  const barStyle = forceDarkContent ? 'dark-content' : dark ? 'light-content' : 'dark-content';

  return (
    <RNStatusBar barStyle={barStyle} translucent backgroundColor="transparent" />
  );
}
