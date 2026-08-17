export type EmotionBubbleInput = {
  emotion: string;
  percentage: number;
};

export type EmotionBubbleLayout = {
  top: number;
  left: number;
  size: number;
  zIndex: number;
};

/** Organic scatter anchors — intentionally off-grid. */
const ORGANIC_ANCHORS = [
  { x: 0.08, y: 0.04 },
  { x: 0.62, y: 0.02 },
  { x: 0.28, y: 0.38 },
  { x: 0.72, y: 0.32 },
  { x: 0.06, y: 0.62 },
];

function hashJitter(seed: string): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  }
  return {
    x: ((h % 13) - 6) * 0.6,
    y: (((h >> 4) % 11) - 5) * 0.6,
  };
}

import { isTablet } from './responsive';

/** Diameter scales with √percentage so area feels proportional. */
function bubbleDiameter(percentage: number, minPct: number): number {
  const scale = isTablet ? 1.65 : 1;
  const baseSize = 66 * scale;
  const maxSize = 94 * scale;
  const scaled = baseSize * Math.sqrt(percentage / minPct);
  return Math.min(maxSize, Math.max(baseSize, scaled));
}

function clampLayout(
  layout: EmotionBubbleLayout,
  containerWidth: number,
  containerHeight: number,
): EmotionBubbleLayout {
  return {
    ...layout,
    left: Math.max(4, Math.min(containerWidth - layout.size - 4, layout.left)),
    top: Math.max(2, Math.min(containerHeight - layout.size - 2, layout.top)),
  };
}

function resolveOverlaps(
  layouts: EmotionBubbleLayout[],
  containerWidth: number,
  containerHeight: number,
): EmotionBubbleLayout[] {
  const result = layouts.map((l) => ({ ...l }));

  for (let pass = 0; pass < 16; pass++) {
    let moved = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        const ax = a.left + a.size / 2;
        const ay = a.top + a.size / 2;
        const bx = b.left + b.size / 2;
        const by = b.top + b.size / 2;
        const minDist = (a.size + b.size) / 2 + 8;
        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist >= minDist) continue;

        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const bWeight = a.size / (a.size + b.size);
        const aWeight = 1 - bWeight;

        a.left -= nx * overlap * aWeight;
        a.top -= ny * overlap * aWeight;
        b.left += nx * overlap * bWeight;
        b.top += ny * overlap * bWeight;

        result[i] = clampLayout(a, containerWidth, containerHeight);
        result[j] = clampLayout(b, containerWidth, containerHeight);
        moved = true;
      }
    }
    if (!moved) break;
  }

  return result;
}

/** Compute scattered bubble positions with percentage-based sizing. */
export function computeEmotionBubbleLayouts(
  emotions: EmotionBubbleInput[],
  containerWidth: number,
  containerHeight: number,
): EmotionBubbleLayout[] {
  if (emotions.length === 0) return [];

  const minPct = Math.min(...emotions.map((e) => e.percentage));

  const indexed = emotions.map((item, index) => ({
    ...item,
    index,
    size: bubbleDiameter(item.percentage, minPct),
  }));

  const placementOrder = [...indexed].sort((a, b) => b.size - a.size);
  const results: EmotionBubbleLayout[] = new Array(emotions.length);

  placementOrder.forEach((item, rank) => {
    const anchor = ORGANIC_ANCHORS[rank % ORGANIC_ANCHORS.length];
    const jitter = hashJitter(item.emotion);

    let left = anchor.x * containerWidth + jitter.x;
    let top = anchor.y * containerHeight + jitter.y;

    left = Math.max(4, Math.min(containerWidth - item.size - 4, left));
    top = Math.max(2, Math.min(containerHeight - item.size - 2, top));

    const zIndex = 10 + Math.round(item.percentage) + Math.round(100 - item.size);

    results[item.index] = {
      top,
      left,
      size: item.size,
      zIndex,
    };
  });

  return resolveOverlaps(results, containerWidth, containerHeight);
}

export function computeAddBubbleLayout(
  layouts: EmotionBubbleLayout[],
  containerWidth: number,
  containerHeight: number,
): { top: number; left: number; size: number; zIndex: number } {
  const size = isTablet ? 56 : 44;
  if (layouts.length === 0) {
    return { top: containerHeight * 0.55, left: containerWidth * 0.72, size, zIndex: 8 };
  }

  const rightmost = layouts.reduce(
    (best, l) => (l.left + l.size > best.left + best.size ? l : best),
    layouts[0],
  );
  let left = rightmost.left + rightmost.size * 0.62;
  let top = rightmost.top + rightmost.size * 0.28;

  left = Math.min(containerWidth - size - 6, Math.max(6, left));
  top = Math.min(containerHeight - size - 4, Math.max(4, top));

  return { top, left, size, zIndex: 6 };
}

