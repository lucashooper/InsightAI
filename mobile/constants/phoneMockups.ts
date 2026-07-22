/** Full-frame Zeno main screen (Product Reveal & marketing) */
export const ZENO_MAIN_PHONE_FULL = require('../public/new-phone-images/Insight-AI-Zeno-Main 1.png');

/** Cropped Zeno main — paywall hero */
export const ZENO_MAIN_PHONE = require('../public/new-phone-images/zeno-main-cut.png');

/** Cropped mockups — legacy carousel assets (Zeno main first) */
export const PAYWALL_PHONE_IMAGES = [
  ZENO_MAIN_PHONE,
  require('../public/new-phone-images/dashboard-cut.png'),
  require('../public/new-phone-images/insights-cut.png'),
  require('../public/new-phone-images/mira-cut.png'),
  require('../public/new-phone-images/playbook-cut.png'),
] as const;

/** Full-frame mockups — onboarding reveal uses Zeno-branded main screen */
export const PRODUCT_REVEAL_PHONE = ZENO_MAIN_PHONE_FULL;
