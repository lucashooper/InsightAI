import AsyncStorage from '@react-native-async-storage/async-storage';

type CachedEntry = {
  version: string;
  title: string;
  content: string;
};

const memoryCache = new Map<string, CachedEntry>();
const loadedUsers = new Set<string>();
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();

const ASYNC_KEY = (userId: string) => `DECRYPT_CACHE_V1_${userId}`;
const MAX_CACHE_ENTRIES = 80;

function cacheKey(userId: string, noteId: string): string {
  return `${userId}:${noteId}`;
}

export function entryVersion(entry: {
  updated_at?: string | null;
  created_at?: string | null;
  is_encrypted?: boolean;
  content?: string | null;
  title?: string | null;
}): string {
  return [
    entry.updated_at || entry.created_at || '',
    entry.is_encrypted ? '1' : '0',
    (entry.content || '').length,
    (entry.title || '').length,
  ].join(':');
}

export async function ensureDecryptCacheLoaded(userId: string): Promise<void> {
  if (loadedUsers.has(userId)) return;
  loadedUsers.add(userId);

  try {
    const raw = await AsyncStorage.getItem(ASYNC_KEY(userId));
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CachedEntry>;
    for (const [noteId, val] of Object.entries(parsed)) {
      memoryCache.set(cacheKey(userId, noteId), val);
    }
  } catch (error) {
    console.warn('[DecryptCache] Failed to load persisted cache:', error);
  }
}

export function getCachedEntry(
  userId: string,
  noteId: string,
  version: string,
): CachedEntry | null {
  const cached = memoryCache.get(cacheKey(userId, noteId));
  if (cached && cached.version === version) return cached;
  return null;
}

function schedulePersist(userId: string): void {
  const existing = persistTimers.get(userId);
  if (existing) clearTimeout(existing);

  persistTimers.set(
    userId,
    setTimeout(() => {
      persistTimers.delete(userId);
      void persistDecryptCache(userId);
    }, 1500),
  );
}

async function persistDecryptCache(userId: string): Promise<void> {
  try {
    const prefix = `${userId}:`;
    const payload: Record<string, CachedEntry> = {};
    for (const [key, val] of memoryCache.entries()) {
      if (!key.startsWith(prefix)) continue;
      const noteId = key.slice(prefix.length);
      payload[noteId] = val;
    }

    const ids = Object.keys(payload);
    if (ids.length > MAX_CACHE_ENTRIES) {
      const trimmed = ids.slice(ids.length - MAX_CACHE_ENTRIES);
      const next: Record<string, CachedEntry> = {};
      for (const id of trimmed) next[id] = payload[id];
      await AsyncStorage.setItem(ASYNC_KEY(userId), JSON.stringify(next));
      return;
    }

    await AsyncStorage.setItem(ASYNC_KEY(userId), JSON.stringify(payload));
  } catch (error) {
    console.warn('[DecryptCache] Failed to persist cache:', error);
  }
}

export function setCachedEntry(
  userId: string,
  noteId: string,
  version: string,
  title: string,
  content: string,
): void {
  memoryCache.set(cacheKey(userId, noteId), { version, title, content });
  schedulePersist(userId);
}

export function invalidateCachedNote(userId: string, noteId: string): void {
  memoryCache.delete(cacheKey(userId, noteId));
  schedulePersist(userId);
}

export function clearDecryptCache(userId?: string): void {
  if (userId) {
    const prefix = `${userId}:`;
    for (const key of [...memoryCache.keys()]) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
    loadedUsers.delete(userId);
    const timer = persistTimers.get(userId);
    if (timer) clearTimeout(timer);
    persistTimers.delete(userId);
    void AsyncStorage.removeItem(ASYNC_KEY(userId));
    return;
  }

  memoryCache.clear();
  loadedUsers.clear();
  for (const timer of persistTimers.values()) clearTimeout(timer);
  persistTimers.clear();
}
