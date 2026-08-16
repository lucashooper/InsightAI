const warmedKeys = new Set<string>();
const pendingKeys = new Set<string>();
let poolTotal = 0;
let allReadyLogged = false;

export function orbWarmupKey(size: number, personality: string, isRoast = false): string {
  return `${size}:${isRoast ? 'roast' : personality}`;
}

export function setOrbPoolTotal(total: number): void {
  poolTotal = total;
  allReadyLogged = false;
  console.log(`[ORB:preload] Pool size set — expecting ${total} orbs`);
}

export function markOrbPending(size: number, personality: string, isRoast = false): void {
  const key = orbWarmupKey(size, personality, isRoast);
  pendingKeys.add(key);
}

export function markOrbWarmed(size: number, personality: string, isRoast = false): void {
  const key = orbWarmupKey(size, personality, isRoast);
  if (warmedKeys.has(key)) return;

  warmedKeys.add(key);
  pendingKeys.delete(key);

  const ready = warmedKeys.size;
  const total = poolTotal || ready + pendingKeys.size;
  console.log(`[ORB:preload] ✓ ready ${key} (${ready}/${total})`);

  if (poolTotal > 0 && ready >= poolTotal && !allReadyLogged) {
    allReadyLogged = true;
    console.log('[ORB:preload] ✅ ALL ORBS LOADED');
  }
}

export function isOrbWarmed(size: number, personality: string, isRoast = false): boolean {
  return warmedKeys.has(orbWarmupKey(size, personality, isRoast));
}

export function getOrbPreloadStatus(): { ready: number; pending: number; total: number } {
  return {
    ready: warmedKeys.size,
    pending: pendingKeys.size,
    total: poolTotal,
  };
}
