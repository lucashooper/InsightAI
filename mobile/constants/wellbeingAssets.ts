import type { WellbeingTier } from '../components/insights/WellbeingIllustrations';

/** Premium tier artwork for the insights hero card — bottom-right, fade-integrated. */
export const WELLBEING_HERO_ART: Record<WellbeingTier, number> = {
  high: require('../assets/insights/wellbeing-high.png'),
  mid: require('../assets/insights/wellbeing-mid.png'),
  low: require('../assets/insights/wellbeing-low.png'),
};
