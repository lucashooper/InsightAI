const ENCRYPTED_CONTENT_REGEX = /^[0-9a-f]{32}:[A-Za-z0-9+/=_-]+$/i;

export function looksEncryptedContent(content?: string | null, isEncryptedFlag?: boolean): boolean {
  if (!content) return false;
  if (isEncryptedFlag) return true;
  const trimmed = content.trim();
  if (ENCRYPTED_CONTENT_REGEX.test(trimmed)) return true;
  return /^[0-9a-f]{32}:[A-Za-z0-9+/=_-]{8,}/i.test(trimmed);
}
