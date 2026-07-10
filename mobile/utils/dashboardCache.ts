import { InteractionManager } from 'react-native';
import {
  notesSignature,
  computeDeferredDashboardData,
} from './computeDashboardData';
import { yieldToUI } from './yieldToUI';

export type DashboardDeferredCache = {
  signature: string;
  patternsToAddress: any[];
  whatsWorking: any[];
  aggregateStrengths: any[];
  aggregateGrowth: any[];
  monthlyStrengths: Array<{ summary: string; count: number; entries: string[] }>;
  monthlyGrowthAreas: Array<{ summary: string; count: number; entries: string[] }>;
};

const cacheByUser = new Map<string, DashboardDeferredCache>();
let prewarmGen = 0;

const CACHE_LOGIC_VERSION = 'pg-v2';

function versionedSignature(signature: string) {
  return `${CACHE_LOGIC_VERSION}:${signature}`;
}

export function getDashboardDeferredCache(userId: string, signature: string): DashboardDeferredCache | null {
  const cached = cacheByUser.get(userId);
  if (cached && cached.signature === versionedSignature(signature)) return cached;
  return null;
}

export function setDashboardDeferredCache(userId: string, data: DashboardDeferredCache) {
  cacheByUser.set(userId, { ...data, signature: versionedSignature(data.signature) });
}

export function clearDashboardCache(userId?: string) {
  if (userId) cacheByUser.delete(userId);
  else cacheByUser.clear();
}

/** Pre-compute patterns in background after notes preload — first Dashboard visit is instant. */
export function prewarmDashboardCache(userId: string, notes: any[]) {
  const signature = notesSignature(notes);
  if (getDashboardDeferredCache(userId, signature)) return;

  const gen = ++prewarmGen;

  InteractionManager.runAfterInteractions(async () => {
    await yieldToUI();
    if (gen !== prewarmGen) return;
    if (getDashboardDeferredCache(userId, signature)) return;

    try {
      const deferred = computeDeferredDashboardData(notes);
      setDashboardDeferredCache(userId, { signature, ...deferred });
      console.log('[Dashboard:Cache] ✅ Prewarmed patterns for', notes.length, 'notes');
    } catch (e) {
      console.error('[Dashboard:Cache] Prewarm failed:', e);
    }
  });
}
