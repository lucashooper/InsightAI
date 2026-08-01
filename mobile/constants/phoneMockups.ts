/** Full-frame Insight main screen (Product Reveal & marketing) */
export const ZENO_MAIN_PHONE_FULL = require('../public/Insight-Main-Phone-New.png');

/** Paywall hero — same rebranded Insight mockup */
export const ZENO_MAIN_PHONE = require('../public/Insight-Main-Phone-New.png');

/** Cropped mockups — legacy carousel assets */
export const PAYWALL_PHONE_IMAGES = [
  ZENO_MAIN_PHONE,
  require('../public/new-phone-images/dashboard-cut.png'),
  require('../public/new-phone-images/insights-cut.png'),
  require('../public/new-phone-images/mira-cut.png'),
  require('../public/new-phone-images/playbook-cut.png'),
] as const;

export const PRODUCT_REVEAL_PHONE = ZENO_MAIN_PHONE_FULL;
