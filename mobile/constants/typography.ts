import type { TextStyle } from 'react-native';
import { sf } from '../utils/responsive';

/**
 * One type scale for the whole app.
 *
 * Every headline shares the same weight ramp and negative tracking so screens
 * read as one product. Use these tokens instead of ad-hoc fontSize/lineHeight
 * pairs; override colour only.
 */

/** Restrained ink palette — charcoal, not pure black. */
export const INK = {
  primary: '#1C1A22',
  secondary: '#5F5B6B',
  tertiary: '#8E8A99',
  inverse: '#FFFFFF',
  onTint: 'rgba(28, 26, 34, 0.86)',
} as const;

/** Neutral surfaces for buttons and chips. */
export const SURFACE = {
  charcoal: '#1C1A22',
  charcoalPressed: '#2A2733',
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
  /** Hero headline — welcome, splash moments. */
  display: t(60, 62, '800', -2.4),
  /** Screen title. */
  h1: t(34, 40, '800', -1.1),
  /** Section / card headline. */
  h2: t(26, 32, '700', -0.7),
  /** Card title. */
  h3: t(20, 26, '700', -0.4),
  /** Row title. */
  title: t(17, 22, '600', -0.2),
  body: t(16, 24, '400', 0),
  bodySm: t(14, 20, '400', 0),
  caption: t(12, 16, '500', 0.1),
  eyebrow: t(12, 16, '700', 1.1, { textTransform: 'uppercase' }),
  button: t(16, 20, '600', -0.1),
  buttonSm: t(14, 18, '600', 0),
} as const satisfies Record<string, Token>;

export type TypoToken = keyof typeof TYPO;
