import { CHAT_PERSONALITIES } from '../../utils/aiPersonalities';
import type { AiPersonality } from '../../utils/aiPersonalities';
import {
  markOrbPending,
  setOrbPoolTotal,
} from '../../utils/orbWarmupRegistry';

export type SlotRect = {
  id: string;
  size: number;
  personality: string;
  isRoast: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  updatedAt: number;
};

export type PoolItem = {
  id: string;
  size: number;
  personality: AiPersonality;
  isRoast?: boolean;
};

/** Unique pool entries — no duplicate size/personality keys. */
function buildPool(): PoolItem[] {
  const items: PoolItem[] = [
    { id: '36-default', size: 36, personality: 'default' },
    { id: '110-default', size: 110, personality: 'default' },
    { id: '130-default', size: 130, personality: 'default' },
    { id: '220-default', size: 220, personality: 'default' },
    { id: '40-balanced', size: 40, personality: 'balanced' },
    ...CHAT_PERSONALITIES.map((personality) => ({
      id: `48-${personality}`,
      size: 48,
      personality,
    })),
    { id: '130-roast', size: 130, personality: 'roast', isRoast: true },
  ];
  return items;
}

export const ORB_POOL = buildPool();

export function findSlotForPoolItem(
  slots: Map<string, SlotRect>,
  item: PoolItem,
): SlotRect | null {
  const personalityKey = item.isRoast ? 'roast' : item.personality;
  let best: SlotRect | null = null;

  for (const slot of slots.values()) {
    const slotPersonality = slot.isRoast ? 'roast' : slot.personality;
    if (slot.size !== item.size) continue;

    const exactMatch = slotPersonality === personalityKey;
    // e.g. 130:default pool orb serves discovery slots using any personality
    const defaultFallback =
      !item.isRoast && item.personality === 'default' && !slot.isRoast;

    if (!exactMatch && !defaultFallback) continue;

    if (!best || slot.updatedAt > best.updatedAt) {
      best = slot;
    }
  }

  return best;
}

export function isValidSlotRect(rect: Pick<SlotRect, 'x' | 'y' | 'width' | 'height'>): boolean {
  return rect.width > 0 && rect.height > 0 && rect.y >= 0 && rect.x >= -8;
}

export function initOrbPoolPending(): void {
  setOrbPoolTotal(ORB_POOL.length);
  console.log('[ORB:preload] Mounting persistent pool —', ORB_POOL.length, 'WebViews');
  for (const item of ORB_POOL) {
    markOrbPending(item.size, item.personality, item.isRoast);
  }
}
