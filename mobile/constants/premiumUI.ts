/**
 * Insight design system — one material language.
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
    secondary: 'rgba(255,255,255,0.72)',
    tertiary: 'rgba(255,255,255,0.55)',
    muted: 'rgba(255,255,255,0.45)',
  },

  /**
   * Dark-theme glass card — DESIGN_SYSTEM.md
   */
  glass: {
    fill: 'rgba(255, 255, 255, 0.05)',
    fillElevated: 'rgba(255, 255, 255, 0.05)',
    fillOverlay: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.12)',
    highlight: 'rgba(255, 255, 255, 0.04)',
    innerShadow: 'rgba(0, 0, 0, 0.35)',
    washTop: 'rgba(255, 255, 255, 0.02)',
    washBottom: 'rgba(0, 0, 0, 0.05)',
    blur: 48,
    shadowOpacity: 0.35,
  },

  /** Light-theme glass card — DESIGN_SYSTEM.md */
  lightGlass: {
    fill: 'rgba(255, 255, 255, 0.45)',
    gradientStart: 'rgba(255, 255, 255, 0.45)',
    gradientEnd: 'rgba(255, 255, 255, 0.45)',
    border: 'rgba(255, 255, 255, 0.65)',
    blur: 48,
    shadowOpacity: 0.04,
  },

  /** Premium reveal card mesh (Figma radials) */
  revealMesh: {
    purple: '#B411FF',
    pink: '#E96161',
    cyan: '#28D8FF',
    base: '#0A0A0F',
  },

  accent: '#8b5cf6',
  accentSoft: 'rgba(139, 92, 246, 0.22)',
  accentMuted: 'rgba(139, 92, 246, 0.12)',

  layout: {
    screenPadH: 20,
    headerTop: 8,
    sectionGap: 28,
    heroTopPadding: 48,
    heroToCardGap: 36,
    cardGap: 16,
    cardPad: 24,
    cardInnerPadH: 20,
    cardInnerPadV: 16,
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
    /** 8pt grid */
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

/**
 * Typography — Linear / Arc / Apple Intelligence restraint.
 * Prefer opacity hierarchy over many colors. Stick to these roles.
 */
export const TYPE = {
  display: {
    fontSize: sf(36),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: sf(36) * -0.04,
    lineHeight: sf(42),
  },
  /** Card / screen primary title — sole high-emphasis element */
  heading: {
    fontSize: sf(28),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: sf(28) * -0.04,
    lineHeight: sf(34),
  },
  /** Legacy alias used by Dashboard / Journal page titles */
  large: {
    fontSize: sf(40),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.9,
    lineHeight: sf(44),
  },
  section: {
    fontSize: sf(18),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: sf(24),
  },
  cardTitle: {
    fontSize: sf(17),
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: sf(22),
  },
  body: {
    fontSize: sf(15),
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: Math.round(sf(15) * 1.4),
  },
  secondary: {
    fontSize: sf(15),
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: Math.round(sf(15) * 1.4),
  },
  caption: {
    fontSize: sf(13),
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: 0,
    lineHeight: sf(18),
  },
  /** Section labels — uppercase, medium, +6% tracking, ~80% opacity in use */
  label: {
    fontSize: sf(11),
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: sf(11) * 0.06,
    lineHeight: sf(14),
    textTransform: 'uppercase' as const,
  },
  /** @deprecated prefer TYPE.label */
  micro: {
    fontSize: sf(11),
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: sf(11) * 0.06,
    lineHeight: sf(14),
    textTransform: 'uppercase' as const,
  },
  /** @deprecated prefer TYPE.label */
  eyebrow: {
    fontSize: sf(11),
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: sf(11) * 0.06,
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
