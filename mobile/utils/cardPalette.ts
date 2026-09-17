/**
 * Generative pastel palettes for cards, heroes and full-page backdrops.
 *
 * Every visual card in Insight derives its colours from a single hue: either a
 * named hue (`'violet'`, `'peach'`, …) or a stable hash of a seed string (an
 * entry id, a protocol title, a category). The same seed always yields the
 * same palette, so cards feel bespoke yet consistent across sessions.
 */

export type CardHue =
  | 'violet'
  | 'peach'
  | 'rose'
  | 'gold'
  | 'aqua'
  | 'sky'
  | 'mint'
  | 'lilac'
  | 'coral'
  | 'teal'
  | 'pink'
  | 'periwinkle';

/** Hue angle (degrees) for each named hue. */
export const HUE_DEGREES: Record<CardHue, number> = {
  violet: 265,
  peach: 22,
  rose: 335,
  gold: 42,
  aqua: 168,
  sky: 212,
  mint: 150,
  lilac: 285,
  coral: 8,
  teal: 190,
  pink: 320,
  periwinkle: 240,
};

/** Curated ring used when a palette is derived from a seed — avoids muddy hues. */
const SEED_RING: CardHue[] = [
  'violet',
  'peach',
  'sky',
  'rose',
  'mint',
  'gold',
  'lilac',
  'aqua',
  'coral',
  'periwinkle',
  'pink',
  'teal',
];

export type CardPalette = {
  /** Named hue when resolvable, otherwise the closest ring hue. */
  name: CardHue;
  /** Hue angle in degrees. */
  hue: number;
  /** Pastel gradient, top-left → bottom-right. */
  gradient: [string, string, string];
  /** Deeper variant for full-page immersive backdrops. */
  backdrop: [string, string, string];
  /** Headline ink on the pastel surface. */
  ink: string;
  /** Body / secondary ink. */
  muted: string;
  /** Saturated accent for pills, progress, avatars. */
  accent: string;
  /** Translucent accent for chips. */
  accentSoft: string;
  /** Illustration primary (hills, blobs). */
  glow: string;
  /** Illustration secondary (trees, highlights) — analogous shift. */
  glowAlt: string;
  /** Illustration tertiary — complementary pop. */
  pop: string;
  /** White-ish surface for inline avatar chips and CTAs. */
  surface: string;
  /** Stronger surface for primary buttons on the card. */
  surfaceStrong: string;
};

/** FNV-1a 32-bit hash — stable across platforms. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32) for illustration layout. */
export function seededRandom(seed: string | number): () => number {
  let a = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function hsl(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  return `hsl(${Math.round(hue)}, ${Math.round(clamp01(s / 100) * 100)}%, ${Math.round(clamp01(l / 100) * 100)}%)`;
}

export function hsla(h: number, s: number, l: number, a: number): string {
  const hue = ((h % 360) + 360) % 360;
  return `hsla(${Math.round(hue)}, ${Math.round(clamp01(s / 100) * 100)}%, ${Math.round(clamp01(l / 100) * 100)}%, ${clamp01(a)})`;
}

function nearestHueName(deg: number): CardHue {
  let best: CardHue = 'violet';
  let bestDist = 999;
  for (const name of Object.keys(HUE_DEGREES) as CardHue[]) {
    const d = Math.abs((((HUE_DEGREES[name] - deg) % 360) + 540) % 360 - 180);
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

/** Build a full palette from a hue angle. */
export function paletteFromDegrees(deg: number): CardPalette {
  const h = ((deg % 360) + 360) % 360;
  // Warm hues (yellow/orange) need less saturation to stay pastel and legible.
  const warm = h > 15 && h < 70;
  const sat = warm ? 78 : 86;

  return {
    name: nearestHueName(h),
    hue: h,
    gradient: [hsl(h - 6, sat, 95), hsl(h + 8, sat - 6, 89), hsl(h + 26, sat - 12, 84)],
    backdrop: [hsl(h - 4, sat - 10, 91), hsl(h + 14, sat - 14, 84), hsl(h + 40, sat - 18, 80)],
    ink: hsl(h, 42, 17),
    muted: hsla(h, 36, 24, 0.68),
    accent: hsl(h, 68, warm ? 52 : 58),
    accentSoft: hsla(h, 68, 58, 0.16),
    glow: hsl(h + 14, 78, 78),
    glowAlt: hsl(h + 48, 70, 76),
    pop: hsl(h + 150, 62, 74),
    surface: 'rgba(255,255,255,0.72)',
    surfaceStrong: 'rgba(255,255,255,0.92)',
  };
}

export function paletteFromHue(hue: CardHue): CardPalette {
  const pal = paletteFromDegrees(HUE_DEGREES[hue]);
  return { ...pal, name: hue };
}

/** Stable palette for any seed — entry ids, titles, categories. */
export function paletteFromSeed(seed: string): CardPalette {
  const idx = hashString(seed) % SEED_RING.length;
  return paletteFromHue(SEED_RING[idx]);
}

export type PaletteSource = { hue?: CardHue | number; seed?: string };

/** Resolve a palette from a hue (named or degrees) or a seed, in that order. */
export function resolvePalette({ hue, seed }: PaletteSource): CardPalette {
  if (typeof hue === 'number') return paletteFromDegrees(hue);
  if (hue) return paletteFromHue(hue);
  if (seed) return paletteFromSeed(seed);
  return paletteFromHue('violet');
}

/** Map protocol / article categories to a hue so related cards rhyme. */
export function hueForCategory(category?: string | null): CardHue {
  switch ((category ?? '').toLowerCase()) {
    case 'coping':
    case 'resilience':
      return 'aqua';
    case 'exercise':
    case 'habits':
      return 'gold';
    case 'social':
    case 'relationships':
      return 'rose';
    case 'mindfulness':
    case 'thinking':
      return 'violet';
    case 'sleep':
      return 'periwinkle';
    case 'nutrition':
      return 'peach';
    case 'anxiety':
      return 'sky';
    case 'gratitude':
      return 'coral';
    case 'general':
    default:
      return 'lilac';
  }
}
