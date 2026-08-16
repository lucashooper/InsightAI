import { EncryptionService } from '../services/encryptionService';
import { looksEncryptedContent } from './encryptionFormat';

export { looksEncryptedContent } from './encryptionFormat';

export async function decryptEntryFields<T extends { content?: string | null; title?: string | null; is_encrypted?: boolean; user_id?: string | null }>(
  entry: T,
): Promise<T> {
  const content = entry.content ?? '';
  const title = entry.title ?? '';

  if (!looksEncryptedContent(content, entry.is_encrypted) && !looksEncryptedContent(title, entry.is_encrypted)) {
    return entry;
  }

  const encryptionKey = await EncryptionService.getKey(entry.user_id ?? undefined);
  if (!encryptionKey) {
    return {
      ...entry,
      content: looksEncryptedContent(content, entry.is_encrypted)
        ? 'This entry is encrypted. Sign in with your account password on this device to unlock it.'
        : content,
      title: looksEncryptedContent(title, entry.is_encrypted) ? 'Encrypted entry' : title,
    };
  }

  let decryptedContent = content;
  let decryptedTitle = title;

  if (looksEncryptedContent(content, entry.is_encrypted)) {
    decryptedContent = await EncryptionService.decrypt(content, encryptionKey, entry.is_encrypted);
    // Only inspect ciphertext shape after decrypt — is_encrypted stays true on the row.
    if (looksEncryptedContent(decryptedContent)) {
      decryptedContent = 'Unable to decrypt this entry on this device.';
    }
  }

  if (looksEncryptedContent(title, entry.is_encrypted)) {
    decryptedTitle = await EncryptionService.decrypt(title, encryptionKey, entry.is_encrypted);
    if (looksEncryptedContent(decryptedTitle)) {
      decryptedTitle = 'Encrypted entry';
    }
  }

  return {
    ...entry,
    content: decryptedContent,
    title: decryptedTitle,
  };
}

export async function decryptEntries<T extends { content?: string | null; title?: string | null; is_encrypted?: boolean }>(
  entries: T[],
): Promise<T[]> {
  const { decryptEntriesInChunks } = await import('./decryptBatch');
  return decryptEntriesInChunks(entries, 4);
}
