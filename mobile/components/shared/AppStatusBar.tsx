import React, { useEffect } from 'react';
import { StatusBar, setStatusBarStyle, type StatusBarStyle } from 'expo-status-bar';
import { useTheme, isDarkTheme, FORCE_LIGHT_MODE } from '../../contexts/ThemeContext';

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
 * Uses expo-status-bar so iOS gets crisp black time/battery glyphs on the
 * light backdrop. Renders the declarative <StatusBar> AND imperatively
 * re-applies the style on every change: several screens mount their own
 * <StatusBar>, and RN resolves the stack by mount order, so a stale entry
 * from a previous screen can otherwise win after a navigation reset.
 */
export default function AppStatusBar({ routeName = null, forceDarkContent = false }: Props) {
  const { theme } = useTheme();

  const routeForcesDark = routeName != null && LIGHT_BACKGROUND_ROUTES.has(routeName);
  const dark = !FORCE_LIGHT_MODE && isDarkTheme(theme.name);
  const style: StatusBarStyle =
    forceDarkContent || routeForcesDark || !dark ? 'dark' : 'light';

  useEffect(() => {
    setStatusBarStyle(style, true);
  }, [style, routeName]);

  return <StatusBar style={style} animated />;
}
