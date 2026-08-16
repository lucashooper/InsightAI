import { Platform } from 'react-native';
import Constants from 'expo-constants';

const TEST_STORE_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY || 'test_wuTAwQKYtsAjXmbyqtuVVRCMWGF';

const IOS_PRODUCTION_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'appl_kqCbylJegHaNzqoGMLhkrprqibn';

function readExtra(key: string): string | undefined {
  const value = Constants.expoConfig?.extra?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** RevenueCat is enabled on iOS only until Android Play Billing is configured. */
export function isRevenueCatEnabled(): boolean {
  return Platform.OS === 'ios';
}

/** @deprecated Use entitlements.ts — Android no longer bypasses checks platform-wide. */
export function shouldBypassSubscriptionChecks(): boolean {
  return false;
}

/** Platform-aware RevenueCat public SDK key for release/dev builds. */
export function getRevenueCatApiKey(): string {
  if (__DEV__) {
    return TEST_STORE_KEY;
  }

  if (Platform.OS === 'android') {
    return (
      readExtra('EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY') ||
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
      TEST_STORE_KEY
    );
  }

  if (Platform.OS === 'ios') {
    return readExtra('EXPO_PUBLIC_REVENUECAT_IOS_API_KEY') || IOS_PRODUCTION_KEY;
  }

  return TEST_STORE_KEY;
}
