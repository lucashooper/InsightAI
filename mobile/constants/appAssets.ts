/** Shared image modules — preload via App.tsx before first render. */
export const HOME_PAGE_GRADIENT = require('../public/home-page-gradient.png');

export const SPLASH_CRITICAL_ASSETS = [
  HOME_PAGE_GRADIENT,
  require('../public/abstract-dark-background.jpg'),
  require('../public/Zeno-Dashboard-background.webp'),
  require('../public/gradient-ellipse.png'),
  require('../public/gradient-ellipse-noise.png'),
  require('../public/purple-ellipse-blur.png'),
  require('../public/Cambridge-Logo-No-Background.png'),
  require('../public/Mira-Orb-No-Background.png'),
  require('../public/Insight-Logo-nobg.webp'),
] as const;
