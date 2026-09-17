import React, { useEffect } from 'react';
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
  'PrivacyMarketing',
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
  /** Force dark icons (light background) regardless of theme/route. */
  forceDarkContent?: boolean;
};

/**
 * Single source of truth for status bar style.
 *
 * Renders the declarative <StatusBar> AND imperatively re-applies the style on
 * every change. Several screens mount their own <StatusBar>; RN resolves the
 * stack by mount order, so a stale entry from a previous screen can win after a
 * navigation reset. The imperative call always applies the latest resolution.
 */
export default function AppStatusBar({ routeName = null, forceDarkContent = false }: Props) {
  const { theme } = useTheme();

  const routeForcesDark = routeName != null && LIGHT_BACKGROUND_ROUTES.has(routeName);
  const dark = isDarkTheme(theme.name);
  const barStyle =
    forceDarkContent || routeForcesDark ? 'dark-content' : dark ? 'light-content' : 'dark-content';

  useEffect(() => {
    RNStatusBar.setBarStyle(barStyle, true);
  }, [barStyle, routeName]);

  return (
    <RNStatusBar barStyle={barStyle} translucent backgroundColor="transparent" />
  );
}
