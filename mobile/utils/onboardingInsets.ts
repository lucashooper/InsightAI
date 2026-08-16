import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Minimum clearance above Android 3-button navigation bar when insets.bottom is 0. */
const ANDROID_NAV_MIN = 48;

/**
 * Bottom padding for onboarding CTAs — clears the system navigation bar on Android.
 */
export function useOnboardingBottomInset(extra = 12): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'android') {
    return Math.max(insets.bottom, ANDROID_NAV_MIN) + extra;
  }
  return Math.max(insets.bottom, 8) + extra;
}

/** Top padding for onboarding headers (status bar / notch). */
export function useOnboardingTopInset(fallback = 12): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'android') {
    return Math.max(insets.top, fallback);
  }
  return insets.top;
}
