import { Easing } from 'react-native';

/** Shared onboarding motion — keep simple for smooth 60fps transitions. */
export const ONBOARDING_MOTION = {
  autoAdvanceMs: 200,
  pageDurationMs: 340,
  pageSlidePx: 28,
  pageEasing: Easing.bezier(0.22, 1, 0.36, 1),
  stackDurationMs: 340,
  stackAnimation: 'slide_from_right' as const,
} as const;
