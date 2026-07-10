import { decryptEntryFields, decryptEntries } from './entryDecryption';

export { decryptEntries };

export async function decryptEntriesInChunks<T extends { content?: string | null; title?: string | null; is_encrypted?: boolean }>(
  entries: T[],
  chunkSize = 6,
): Promise<T[]> {
  if (entries.length === 0) return [];
  const result: T[] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const decrypted = await Promise.all(chunk.map((e) => decryptEntryFields(e)));
    result.push(...decrypted);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return result;
}
