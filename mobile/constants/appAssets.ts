/** Shared image modules — all preloaded during splash before first screen. */

import { FAB_MENU_BACKGROUNDS } from './fabMenuAssets';
import { WELLBEING_HERO_ART } from './wellbeingAssets';
import { PAYWALL_PHONE_IMAGES, PRODUCT_REVEAL_PHONE } from './phoneMockups';

export const HOME_PAGE_GRADIENT = require('../public/home-page-gradient.png');
export const SPLASH_BACKGROUND = require('../public/abstract-dark-background.jpg');
export const SPLASH_PREMIUM = require('../public/splash-premium.jpg');
export const SPLASH_LOADING_WORDMARK = require('../public/Insight-Loading-Text-White-Version.png');
export const INSIGHT_LOGO = require('../public/Insight-Logo-nobg.webp');
export const MIRA_ORB = require('../public/Mira-Orb-No-Background.png');
export const INSIGHT_ORB = require('../public/InsightAI-Orb.png');

export const ONBOARDING_MEDITATION_LOTTIE = require('../public/animations/Stress Management.json');
export const ONBOARDING_FOCUS_LOTTIE = require('../public/animations/focus-mindfulness.json');

/** Raster images — downloaded, decoded, and warmed before the app opens. */
export const ALL_PRELOAD_IMAGES = [
  HOME_PAGE_GRADIENT,
  SPLASH_LOADING_WORDMARK,
  INSIGHT_LOGO,
  MIRA_ORB,
  INSIGHT_ORB,
  require('../public/abstract-dark-background.jpg'),
  require('../public/cool-gradient-bg.png'),
  require('../public/gradient-ellipse.png'),
  require('../public/gradient-ellipse-noise.png'),
  require('../public/purple-ellipse-blur.png'),
  require('../public/InsightAI-New-Logo.png'),
  require('../public/InsightAI-Onboarding-MAIN.png'),
  require('../public/Insight-Main-Phone-New.png'),
  require('../public/Modern-Iphone-Insight-LANDING.png'),
  require('../public/Onboarding-Main-Phone-Image.png'),
  require('../public/Cambridge-Logo-No-Background.png'),
  require('../assets/Cambridge-logo.png'),
  require('../assets/192px-Insight-ICON.png'),
  require('../assets/splash.png'),
  require('../public/noisy-image.webp'),
  require('../public/clarity-image.webp'),
  require('../public/onboarding-icons/BellIcon.webp'),
  require('../public/onboarding-icons/Email-Icon2.webp'),
  require('../public/onboarding-icons/LockIcon2.webp'),
  require('../public/Book-Icon-Insight.webp'),
  require('../public/research-images/Cambridge-Logo-Frame.png'),
  require('../public/research-images/Liverpool-Logo.jpg'),
  require('../public/research-images/Smaller-Kaiser-Logo.png'),
  require('../public/research-images/APA-LOGO.png'),
  require('../public/ambient-stuff/rain-image.jpg'),
  require('../public/ambient-stuff/campfire-image.jpg'),
  require('../public/Zeno-Dashboard-background.webp'),
  PRODUCT_REVEAL_PHONE,
  ...PAYWALL_PHONE_IMAGES,
  FAB_MENU_BACKGROUNDS.journal,
  FAB_MENU_BACKGROUNDS.aiChat,
  FAB_MENU_BACKGROUNDS.playbook,
  FAB_MENU_BACKGROUNDS.checkIn,
  WELLBEING_HERO_ART.high,
  WELLBEING_HERO_ART.mid,
  WELLBEING_HERO_ART.low,
] as const;

/** Lottie JSON — bundled synchronously; downloaded at boot for consistency. */
export const ALL_PRELOAD_LOTTIES = [
  ONBOARDING_MEDITATION_LOTTIE,
  ONBOARDING_FOCUS_LOTTIE,
] as const;

export const ALL_PRELOAD_ASSETS = [...ALL_PRELOAD_IMAGES, ...ALL_PRELOAD_LOTTIES] as const;

/** @deprecated Use ALL_PRELOAD_IMAGES */
export const SPLASH_CRITICAL_ASSETS = ALL_PRELOAD_ASSETS;
