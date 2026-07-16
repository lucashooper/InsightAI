import { EncryptionService } from '../services/encryptionService';

const ENCRYPTED_CONTENT_REGEX = /^[0-9a-f]{32}:[A-Za-z0-9+/=_-]+$/i;

export function looksEncryptedContent(content?: string | null, isEncryptedFlag?: boolean): boolean {
  if (!content) return false;
  if (isEncryptedFlag) return true;
  const trimmed = content.trim();
  if (ENCRYPTED_CONTENT_REGEX.test(trimmed)) return true;
  return /^[0-9a-f]{32}:[A-Za-z0-9+/=_-]{8,}/i.test(trimmed);
}

export async function decryptEntryFields<T extends { content?: string | null; title?: string | null; is_encrypted?: boolean }>(
  entry: T,
): Promise<T> {
  const content = entry.content ?? '';
  const title = entry.title ?? '';

  if (!looksEncryptedContent(content, entry.is_encrypted) && !looksEncryptedContent(title, entry.is_encrypted)) {
    return entry;
  }

  const encryptionKey = await EncryptionService.getKey();
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
    decryptedContent = await EncryptionService.decrypt(content, encryptionKey);
    if (looksEncryptedContent(decryptedContent)) {
      decryptedContent = 'Unable to decrypt this entry on this device.';
    }
  }

  if (looksEncryptedContent(title, entry.is_encrypted)) {
    decryptedTitle = await EncryptionService.decrypt(title, encryptionKey);
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
