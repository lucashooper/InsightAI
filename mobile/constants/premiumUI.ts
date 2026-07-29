/**
 * Zeno design system — one material language.
 *
 * Glass is defined by translucency + soft lighting, never coloured outlines.
 * Every card / input / widget inherits GlassSurface — content changes, material does not.
 */

import { TextStyle, Platform, ViewStyle } from 'react-native';
import { sf } from '../utils/responsive';

export const PREMIUM = {
  bg: '#09090B',
  bgElevated: '#0C0C10',

  text: {
    primary: 'rgba(255,255,255,0.96)',
    secondary: 'rgba(255,255,255,0.58)',
    tertiary: 'rgba(255,255,255,0.40)',
  },

  /**
   * Zeno Glass Surface — the ONLY glass recipe.
   * Do not invent per-screen variants.
   */
  glass: {
    /** More translucent — closer to floating tab bar frosted feel */
    fill: 'rgba(18, 18, 22, 0.38)',
    fillElevated: 'rgba(18, 18, 22, 0.48)',
    fillOverlay: 'rgba(18, 18, 22, 0.32)',
    border: 'rgba(255, 255, 255, 0.08)',
    /** Near-invisible top sheen — no hard white line */
    highlight: 'rgba(255, 255, 255, 0.035)',
    innerShadow: 'rgba(0, 0, 0, 0.18)',
    washTop: 'rgba(255, 255, 255, 0.015)',
    washBottom: 'rgba(0, 0, 0, 0.06)',
    blur: 48,
  },

  accent: '#8b5cf6',
  accentSoft: 'rgba(139, 92, 246, 0.22)',
  accentMuted: 'rgba(139, 92, 246, 0.12)',

  layout: {
    screenPadH: 20,
    headerTop: 8,
    sectionGap: 24,
    cardGap: 16,
    cardPad: 24,
  },

  radius: {
    button: 20,
    card: 28,
    input: 28,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 999,
  },

  space: {
    /** 8pt grid aliases used across screens */
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 40,
    6: 48,
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  },

  shadow: {
    soft: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 28,
      },
      android: { elevation: 6 },
      default: {},
    }) as ViewStyle,
  },

  motion: {
    enterMs: 320,
    spring: { damping: 22, stiffness: 180, mass: 0.9 },
    breatheMs: 26000,
  },
} as const;

/** Typography — page titles sit at ~40, not WWDC-scale */
export const TYPE = {
  display: {
    fontSize: sf(48),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -1.2,
    lineHeight: sf(52),
  },
  /** Main page headings: Dashboard, Journal */
  large: {
    fontSize: sf(40),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.9,
    lineHeight: sf(44),
  },
  section: {
    fontSize: sf(20),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    lineHeight: sf(26),
  },
  cardTitle: {
    fontSize: sf(17),
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: sf(22),
  },
  body: {
    fontSize: sf(16),
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: sf(24),
  },
  secondary: {
    fontSize: sf(15),
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.1,
    lineHeight: sf(22),
  },
  caption: {
    fontSize: sf(13),
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: sf(18),
  },
  micro: {
    fontSize: sf(11),
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 1.4,
    lineHeight: sf(14),
    textTransform: 'uppercase' as const,
  },
  eyebrow: {
    fontSize: sf(11),
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 1.4,
    lineHeight: sf(14),
    textTransform: 'uppercase' as const,
  },
};

export const REVEAL_AMBIENT_TINT: Record<string, string> = {
  biggest_strength: 'rgba(139, 92, 246, 0.10)',
  biggest_weakness: 'rgba(139, 92, 246, 0.08)',
  hidden_trait: 'rgba(167, 139, 250, 0.09)',
  blind_spot: 'rgba(99, 102, 241, 0.08)',
  emotional_trigger: 'rgba(244, 114, 182, 0.07)',
  biggest_improvement: 'rgba(52, 211, 153, 0.07)',
  growth_opportunity: 'rgba(139, 92, 246, 0.09)',
  recurring_pattern: 'rgba(139, 92, 246, 0.08)',
  insufficient_data: 'rgba(255,255,255,0.04)',
};
