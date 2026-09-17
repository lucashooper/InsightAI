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
    border: 'rgba(255, 255, 255, 0.06)',
    highlight: 'rgba(255, 255, 255, 0.04)',
    innerShadow: 'rgba(0, 0, 0, 0.35)',
    washTop: 'rgba(255, 255, 255, 0.02)',
    washBottom: 'rgba(0, 0, 0, 0.05)',
    blur: 48,
    shadowOpacity: 0.35,
  },

  /** Light-theme glass card — softer, less bright */
  lightGlass: {
    fill: 'rgba(255, 255, 255, 0.32)',
    gradientStart: 'rgba(255, 255, 255, 0.38)',
    gradientEnd: 'rgba(255, 255, 255, 0.22)',
    border: 'rgba(255, 255, 255, 0.28)',
    blur: 48,
    shadowOpacity: 0.03,
  },

  /** Insights / Recap overlay — unified frosted family */
  recapGlass: {
    fill: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(255, 255, 255, 0.85)',
    blur: 20,
    shadowColor: 'rgba(120, 100, 180, 0.08)',
    shadowOffset: { width: 0, height: 4 } as ViewStyle['shadowOffset'],
    shadowRadius: 16,
    elevation: 3,
    radius: 20,
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
    heroTopPadding: 24,
    heroToCardGap: 36,
    cardGap: 16,
    cardPad: 24,
    cardInnerPadH: 20,
    cardInnerPadV: 16,
  },

  radius: {
    button: 22,
    card: 32,
    input: 28,
    md: 16,
    lg: 22,
    xl: 28,
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
 * Typography — round, high-contrast, friendly.
 * Display/headings carry weight; body stays readable.
 */
export const TYPE = {
  display: {
    fontSize: sf(38),
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1.2,
    lineHeight: sf(44),
  },
  /** Card / screen primary title — sole high-emphasis element */
  heading: {
    fontSize: sf(30),
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -0.8,
    lineHeight: sf(36),
  },
  /** Legacy alias used by Dashboard / Journal page titles */
  large: {
    fontSize: sf(42),
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -1.1,
    lineHeight: sf(46),
  },
  section: {
    fontSize: sf(22),
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    lineHeight: sf(28),
  },
  cardTitle: {
    fontSize: sf(18),
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.35,
    lineHeight: sf(24),
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

export type JourneyHue = 'violet' | 'peach' | 'rose' | 'gold' | 'aqua' | 'sky';

/** Colorful journey units — Insight palette, not a mint/cloud clone. */
export const JOURNEY: Record<
  JourneyHue,
  {
    light: [string, string];
    dark: [string, string];
    inkLight: string;
    inkDark: string;
    mutedLight: string;
    mutedDark: string;
  }
> = {
  violet: {
    light: ['#F1E8FF', '#DCC6FF'],
    dark: ['#3D2A63', '#2A1C48'],
    inkLight: '#2C184F',
    inkDark: '#F6EEFF',
    mutedLight: 'rgba(44, 24, 79, 0.62)',
    mutedDark: 'rgba(246, 238, 255, 0.72)',
  },
  peach: {
    light: ['#FFE7D6', '#FFCDB0'],
    dark: ['#5A3226', '#3D211A'],
    inkLight: '#5C2412',
    inkDark: '#FFE8DC',
    mutedLight: 'rgba(92, 36, 18, 0.62)',
    mutedDark: 'rgba(255, 232, 220, 0.72)',
  },
  rose: {
    light: ['#FFD9E8', '#F7B7D0'],
    dark: ['#5A2740', '#3D1A2C'],
    inkLight: '#5C1838',
    inkDark: '#FFE6F0',
    mutedLight: 'rgba(92, 24, 56, 0.62)',
    mutedDark: 'rgba(255, 230, 240, 0.72)',
  },
  gold: {
    light: ['#FFE9C4', '#FFD28A'],
    dark: ['#5A4318', '#3D2E10'],
    inkLight: '#5C3D0A',
    inkDark: '#FFF0D2',
    mutedLight: 'rgba(92, 61, 10, 0.62)',
    mutedDark: 'rgba(255, 240, 210, 0.72)',
  },
  aqua: {
    light: ['#D6F4EE', '#B3E4DA'],
    dark: ['#1A4540', '#12332F'],
    inkLight: '#11403A',
    inkDark: '#D9F6F0',
    mutedLight: 'rgba(17, 64, 58, 0.62)',
    mutedDark: 'rgba(217, 246, 240, 0.72)',
  },
  sky: {
    light: ['#D9E8FF', '#B7D2F7'],
    dark: ['#1E3358', '#15243F'],
    inkLight: '#16325C',
    inkDark: '#E4EEFF',
    mutedLight: 'rgba(22, 50, 92, 0.62)',
    mutedDark: 'rgba(228, 238, 255, 0.72)',
  },
};

export function journeyForCategory(category?: string): JourneyHue {
  switch (category) {
    case 'coping':
      return 'aqua';
    case 'exercise':
      return 'gold';
    case 'social':
      return 'rose';
    case 'mindfulness':
      return 'violet';
    case 'sleep':
      return 'sky';
    case 'nutrition':
      return 'peach';
    default:
      return 'violet';
  }
}

export function journeyInk(hue: JourneyHue, dark: boolean): string {
  return dark ? JOURNEY[hue].inkDark : JOURNEY[hue].inkLight;
}

export function journeyMuted(hue: JourneyHue, dark: boolean): string {
  return dark ? JOURNEY[hue].mutedDark : JOURNEY[hue].mutedLight;
}

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
