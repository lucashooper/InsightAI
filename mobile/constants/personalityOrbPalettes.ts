import type { AiPersonality } from '../utils/aiPersonalities';

type BlobDef = {
  rgb: string;
  alpha: number;
  diameter: number;
  cx: number;
  cy: number;
  driftX: number;
  driftY: number;
  scaleFrom: number;
  scaleTo: number;
  duration: number;
};

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '');
  const v = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(v >> 16) & 255},${(v >> 8) & 255},${v & 255}`;
}

function buildPalette(primary: string, secondary: string): BlobDef[] {
  const p = hexToRgbTriplet(primary);
  const s = hexToRgbTriplet(secondary);
  return [
    { rgb: p, alpha: 0.92, diameter: 0.78, cx: 0.48, cy: 0.48, driftX: 5, driftY: -4, scaleFrom: 0.98, scaleTo: 1.04, duration: 9000 },
    { rgb: s, alpha: 0.82, diameter: 0.64, cx: 0.58, cy: 0.54, driftX: -6, driftY: 5, scaleFrom: 1.02, scaleTo: 0.97, duration: 11000 },
    { rgb: p, alpha: 0.68, diameter: 0.52, cx: 0.42, cy: 0.58, driftX: 4, driftY: 4, scaleFrom: 0.96, scaleTo: 1.03, duration: 12500 },
    { rgb: s, alpha: 0.58, diameter: 0.48, cx: 0.62, cy: 0.4, driftX: -4, driftY: -3, scaleFrom: 1.01, scaleTo: 0.98, duration: 10000 },
  ];
}

export const PERSONALITY_ORB_COLORS: Record<
  AiPersonality,
  { primary: string; secondary: string }
> = {
  default: { primary: '#bd8af0', secondary: '#bae6fd' },
  balanced: { primary: '#7B5EA7', secondary: '#A8EDEA' },
  cheerful: { primary: '#FFB347', secondary: '#FF6B9D' },
  direct: { primary: '#3B82F6', secondary: '#1E3A5F' },
  playful: { primary: '#F59E0B', secondary: '#EC4899' },
  gentle: { primary: '#86EFAC', secondary: '#BAE6FD' },
  roast: { primary: '#DC2626', secondary: '#EA580C' },
  hype: { primary: '#F97316', secondary: '#EF4444' },
};

export const PERSONALITY_ORB_BLOBS: Record<AiPersonality, BlobDef[]> = Object.fromEntries(
  (Object.keys(PERSONALITY_ORB_COLORS) as AiPersonality[]).map((key) => [
    key,
    buildPalette(PERSONALITY_ORB_COLORS[key].primary, PERSONALITY_ORB_COLORS[key].secondary),
  ]),
) as Record<AiPersonality, BlobDef[]>;

export type PersonalityOrbBlob = BlobDef;
