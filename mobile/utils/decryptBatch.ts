import {
  decryptEntryFields,
  decryptEntries,
  looksEncryptedContent,
} from './entryDecryption';
import {
  ensureDecryptCacheLoaded,
  entryVersion,
  getCachedEntry,
  setCachedEntry,
} from './decryptCache';
import { yieldToUI } from './yieldToUI';

export { decryptEntries };

const LIST_PRIORITY = 15;

type NoteLike = {
  id?: string;
  content?: string | null;
  title?: string | null;
  is_encrypted?: boolean;
  updated_at?: string | null;
  created_at?: string | null;
};

function needsDecrypt(entry: NoteLike): boolean {
  return (
    looksEncryptedContent(entry.content, entry.is_encrypted)
    || looksEncryptedContent(entry.title, entry.is_encrypted)
  );
}

function applyCacheHit<T extends NoteLike>(entry: T, userId: string): T | null {
  if (!entry.id) return null;
  const version = entryVersion(entry);
  const cached = getCachedEntry(userId, entry.id, version);
  if (!cached) return null;
  return { ...entry, title: cached.title, content: cached.content };
}

export async function decryptEntryFieldsCached<T extends NoteLike>(
  entry: T,
  userId: string,
): Promise<T> {
  await ensureDecryptCacheLoaded(userId);

  const cached = entry.id ? applyCacheHit(entry, userId) : null;
  if (cached) return cached;

  const decrypted = await decryptEntryFields(entry);
  if (entry.id) {
    setCachedEntry(
      userId,
      entry.id,
      entryVersion(entry),
      decrypted.title ?? '',
      decrypted.content ?? '',
    );
  }
  return decrypted;
}

export async function decryptEntriesInChunks<T extends NoteLike>(
  entries: T[],
  chunkSize = 4,
  userId?: string,
): Promise<T[]> {
  if (entries.length === 0) return [];
  if (!userId) {
    return decryptEntriesInChunksUncached(entries, chunkSize);
  }

  await ensureDecryptCacheLoaded(userId);

  const result: T[] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const decrypted = await Promise.all(
      chunk.map((entry) => decryptEntryFieldsCached(entry, userId)),
    );
    result.push(...decrypted);
    await yieldToUI();
  }
  return result;
}

async function decryptEntriesInChunksUncached<T extends NoteLike>(
  entries: T[],
  chunkSize: number,
): Promise<T[]> {
  const result: T[] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const decrypted = await Promise.all(chunk.map((e) => decryptEntryFields(e)));
    result.push(...decrypted);
    await yieldToUI();
  }
  return result;
}

function mergeDecrypted<T extends NoteLike>(base: T[], decrypted: T[]): T[] {
  const map = new Map(decrypted.filter((e) => e.id).map((e) => [e.id!, e]));
  return base.map((entry) => (entry.id && map.has(entry.id) ? map.get(entry.id)! : entry));
}

/**
 * Decrypt visible list notes first, then finish the rest in the background.
 * Cache hits skip crypto entirely.
 */
export async function decryptNotesLazy<T extends NoteLike>(
  entries: T[],
  userId: string,
): Promise<{ immediate: T[]; finishBackground: () => Promise<T[]> }> {
  await ensureDecryptCacheLoaded(userId);

  if (entries.length === 0) {
    return { immediate: [], finishBackground: async () => [] };
  }

  const withCache = entries.map((entry) => applyCacheHit(entry, userId) || entry);
  const stillEncrypted = withCache.filter(needsDecrypt);

  if (stillEncrypted.length === 0) {
    return { immediate: withCache, finishBackground: async () => withCache };
  }

  const priorityIds = new Set(
    withCache.slice(0, LIST_PRIORITY).map((e) => e.id).filter(Boolean) as string[],
  );

  const priority = stillEncrypted.filter((e) => e.id && priorityIds.has(e.id));
  const deferred = stillEncrypted.filter((e) => !e.id || !priorityIds.has(e.id));

  const decryptedPriority = await Promise.all(
    priority.map((entry) => decryptEntryFieldsCached(entry, userId)),
  );
  const immediate = mergeDecrypted(withCache, decryptedPriority);

  const finishBackground = async () => {
    if (deferred.length === 0) return immediate;

    const decryptedDeferred = await decryptEntriesInChunks(deferred, 4, userId);
    return mergeDecrypted(immediate, decryptedDeferred);
  };

  return { immediate, finishBackground };
}
