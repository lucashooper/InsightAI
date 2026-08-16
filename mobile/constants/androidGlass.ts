import { Platform } from 'react-native';

/** Android fallback fills — no BlurView; avoid elevation artifacts. */
export const ANDROID_GLASS = {
  darkCard: 'rgba(18, 18, 22, 0.55)',
  lightCard: 'rgba(255, 255, 255, 0.92)',
  darkInput: '#14141A',
  darkChip: 'rgba(255, 255, 255, 0.08)',
} as const;

export function androidGlassCardBackground(dark: boolean): string {
  if (Platform.OS !== 'android') return 'transparent';
  return dark ? ANDROID_GLASS.darkCard : ANDROID_GLASS.lightCard;
}

export function androidOnboardingSurface(dark: boolean): string {
  if (Platform.OS !== 'android') return 'transparent';
  return dark ? ANDROID_GLASS.darkInput : ANDROID_GLASS.lightCard;
}
