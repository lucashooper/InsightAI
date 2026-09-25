import type { TextStyle } from 'react-native';
import { sf } from '../utils/responsive';

/**
 * Four-tier type scale — use these everywhere instead of ad-hoc sizes.
 *
 * | Tier        | Size   | Weight   | Use                          |
 * |-------------|--------|----------|------------------------------|
 * | Display     | 30px   | Bold     | Greeting, hero headlines     |
 * | Heading     | 21px   | Bold     | Section titles ("For you")   |
 * | Subheading  | 17px   | SemiBold | Card titles, row labels      |
 * | Body        | 15px   | Regular  | Subtitles, descriptions      |
 */

/** Restrained ink palette — charcoal, not pure black. */
export const INK = {
  primary: '#1C1A22',
  secondary: '#5F5B6B',
  /** ~65% opacity equivalent on white — use for subtitles. */
  tertiary: '#8E8A99',
  muted: 'rgba(28, 26, 34, 0.65)',
  inverse: '#FFFFFF',
  onTint: 'rgba(28, 26, 34, 0.86)',
} as const;

/** Neutral surfaces for buttons and chips. */
export const SURFACE = {
  charcoal: '#111115',
  charcoalPressed: '#1C1A22',
  light: 'rgba(255, 255, 255, 0.78)',
  lightSolid: '#F4F2F7',
  lightBorder: 'rgba(28, 26, 34, 0.06)',
  frosted: 'rgba(255, 255, 255, 0.55)',
} as const;

type Token = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing' | 'textTransform'>;

const t = (
  fontSize: number,
  lineHeight: number,
  fontWeight: TextStyle['fontWeight'],
  letterSpacing: number,
  extra?: Partial<Token>,
): Token => ({ fontSize: sf(fontSize), lineHeight: sf(lineHeight), fontWeight, letterSpacing, ...extra });

export const TYPO = {
  /** Tier 1 — greeting, welcome hero (28–32px bold). */
  display: t(30, 36, '700', -0.8),
  /** Large display for onboarding only. */
  displayLg: t(60, 62, '800', -2.4),
  /** Tier 2 — section titles (20–22px bold). */
  heading: t(21, 28, '700', -0.45),
  /** Tier 3 — card titles (17–18px semi-bold). */
  subheading: t(17, 24, '600', -0.25),
  /** Tier 4 — body copy (14–15px regular). */
  body: t(15, 22, '400', 0),
  bodySm: t(14, 20, '400', 0),
  caption: t(12, 16, '500', 0.1),
  eyebrow: t(12, 16, '700', 1.1, { textTransform: 'uppercase' }),
  button: t(16, 20, '600', -0.1),
  buttonSm: t(14, 18, '600', 0),

  // ── Aliases (migrate screens gradually) ──
  h1: t(30, 36, '700', -0.8),
  h2: t(21, 28, '700', -0.45),
  h3: t(17, 24, '600', -0.25),
  title: t(17, 24, '600', -0.25),
} as const;

export type TypoToken = keyof typeof TYPO;

/** Apply body tier with muted ink for subtitles. */
export function mutedBody(style?: TextStyle): TextStyle {
  return { ...TYPO.body, color: INK.muted, ...style };
}
