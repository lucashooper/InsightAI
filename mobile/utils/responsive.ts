import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device detection
export const isTablet = SCREEN_WIDTH >= 768;
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/**
 * Returns iPad-specific value or phone value.
 */
export function tablet<T>(phoneValue: T, tabletValue: T): T {
  return isTablet ? tabletValue : phoneValue;
}

/**
 * Scale font size for iPad. Multiplies by ~1.5x on tablet.
 */
export function sf(size: number): number {
  if (!isTablet) return size;
  return Math.round(PixelRatio.roundToNearestPixel(size * 1.5));
}

/**
 * Scale spacing/dimensions for iPad. Multiplies by ~1.6x on tablet.
 */
export function ss(size: number): number {
  if (!isTablet) return size;
  return Math.round(PixelRatio.roundToNearestPixel(size * 1.6));
}

/**
 * Scale icon sizes for iPad. Multiplies by ~1.5x on tablet.
 */
export function si(size: number): number {
  if (!isTablet) return size;
  return Math.round(size * 1.5);
}

/**
 * Max-width container style for iPad to prevent content from stretching too wide.
 */
export const iPadContentStyle = isTablet ? {
  maxWidth: 820,
  alignSelf: 'center' as const,
  width: '100%' as const,
} : {};

/**
 * Wider max-width container for screens that can use more space.
 */
export const iPadWideContentStyle = isTablet ? {
  maxWidth: 920,
  alignSelf: 'center' as const,
  width: '100%' as const,
} : {};

/**
 * Screen horizontal padding
 */
export const screenPadding = isTablet ? 48 : 24;
