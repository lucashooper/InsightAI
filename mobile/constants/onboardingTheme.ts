/** Onboarding-only surfaces — light glassmorphic cards. */
export const ONBOARDING_SURFACE = {
  fill: 'rgba(255, 255, 255, 0.7)',
  fillElevated: 'rgba(255, 255, 255, 0.82)',
  fillSelected: 'rgba(123, 94, 167, 0.1)',
  border: 'rgba(200, 185, 255, 0.35)',
  borderSelected: '#7B5EA7',
  iconChip: 'rgba(255, 255, 255, 0.85)',
  iconChipSelected: 'rgba(123, 94, 167, 0.12)',
} as const;

export const ONBOARDING_CTA = {
  background: '#7B5EA7',
  text: '#ffffff',
  shadow: 'rgba(120, 80, 200, 0.25)',
  borderRadius: 18,
  paddingVertical: 20,
} as const;

export const ONBOARDING_BG = '#f0eeff';

export const ONBOARDING_GRADIENT = ['#f0eeff', '#fce8f0', '#e8f0ff'] as const;

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
