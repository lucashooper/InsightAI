import { sf } from '../utils/responsive';
import { SURFACE, TYPO } from './typography';

/** Onboarding-only surfaces — light glassmorphic cards. */
export const ONBOARDING_SURFACE = {
  fill: 'rgba(255, 255, 255, 0.88)',
  fillElevated: 'rgba(255, 255, 255, 0.92)',
  /** ~10% brand tint — selected reads by contrast, not heaviness */
  fillSelected: 'rgba(123, 94, 167, 0.1)',
  border: 'rgba(200, 195, 210, 0.45)',
  borderSelected: 'rgba(123, 94, 167, 0.55)',
  iconChip: 'rgba(255, 255, 255, 0.92)',
  iconChipSelected: 'rgba(123, 94, 167, 0.08)',
} as const;

/** Main CTAs are charcoal pills everywhere — colour belongs to cards, not buttons. */
export const ONBOARDING_CTA = {
  background: SURFACE.charcoal,
  text: '#ffffff',
  shadow: 'rgba(28, 26, 34, 0.22)',
  borderRadius: 999,
  paddingVertical: 20,
} as const;

export const ONBOARDING_BG = '#eef4fc';

/** Single sky-wash family — low saturation so content stays focal */
export const ONBOARDING_GRADIENT = ['#f8fbff', '#eef4fc', '#e3edf8'] as const;

/** Onboarding copy — dark on light gradient. */
export const ONBOARDING_TEXT = {
  primary: '#1a1a2e',
  body: '#3d3d5c',
  secondary: '#6b6b8a',
  tertiary: 'rgba(107, 107, 138, 0.75)',
} as const;

export const ONBOARDING_BRAND = {
  purple: '#7B5EA7',
  overlay: 'rgba(180, 160, 220, 0.2)',
} as const;

/** Shared onboarding typography — use on every onboarding screen. */
export const ONBOARDING_TYPE = {
  title: {
    ...TYPO.heading,
    textAlign: 'center' as const,
  },
  subtitle: {
    ...TYPO.body,
    textAlign: 'center' as const,
  },
  skip: {
    fontSize: sf(15),
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
} as const;

/** Onboarding always renders on a light gradient — never branch on app dark theme. */
export const ONBOARDING_ALWAYS_LIGHT = true;

/** Shared light-theme tokens for all onboarding screens. */
export const ONBOARDING_LIGHT = {
  statusBar: 'dark-content' as const,
  backCircleBg: 'rgba(255, 255, 255, 0.75)',
  backCircleBorder: 'rgba(200, 185, 255, 0.35)',
  backIcon: ONBOARDING_TEXT.primary,
  surfaceFill: 'rgba(255, 255, 255, 0.6)',
  surfaceBorder: 'rgba(255, 255, 255, 0.4)',
  progressTrack: 'rgba(0,0,0,0.06)',
  skipText: ONBOARDING_TEXT.secondary,
};
