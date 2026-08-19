import { isTablet, screenPadding, si, ss } from '../utils/responsive';

/** Shared spacing/sizing for onboarding screens — phone + iPad. */
export const ONBOARDING_LAYOUT = {
  backTop: isTablet ? 60 : 50,
  backLeft: screenPadding,
  backSize: isTablet ? 44 : 36,
  backRadius: isTablet ? 22 : 18,
  backIconSize: si(20),
  contentTop: isTablet ? 120 : 110,
  contentHorizontal: screenPadding,
  footerBottom: isTablet ? 70 : 50,
  footerTop: 16,
  /** Centered logo pages (privacy, value prop, notifications, summary). */
  logoSize: isTablet ? 200 : 100,
  logoTop: isTablet ? 60 : 50,
  /** Space below logo before main copy on centered logo screens. */
  logoContentOffset: isTablet ? 100 : 88,
  subtitleGap: isTablet ? 48 : 36,
  /** Insight intro / personality handoff orb. */
  introOrbSize: ss(220),
} as const;
