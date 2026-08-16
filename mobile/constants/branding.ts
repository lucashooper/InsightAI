/** User-facing app brand name. */
export const APP_NAME = 'Insight';

/** Display name for the premium tier (RevenueCat entitlement IDs stay unchanged). */
export const PRO_DISPLAY_NAME = 'Insight Pro';

/** Prefix stored in journal entries for guided prompts. */
export const JOURNAL_PROMPT_PREFIX = 'Insight Prompt';

/** Matches legacy Insight Prompt tags and Zeno Prompt tags. */
export const JOURNAL_PROMPT_TAG_REGEX = /\[(?:Insight|Zeno) Prompt: ([^\]]+)\]/g;

export const JOURNAL_PROMPT_STRIP_REGEX = /\[(?:Insight|Zeno) Prompt: [\s\S]*?\]\n*/;

export function formatJournalPromptContent(promptText: string, content: string): string {
  return `[${JOURNAL_PROMPT_PREFIX}: ${promptText}]\n\n${content}`;
}

export function stripJournalPromptTag(content: string): string {
  return content.replace(JOURNAL_PROMPT_STRIP_REGEX, '').trim();
}

export function extractJournalPromptText(content: string): string | null {
  const match = content.match(/\[(?:Insight|Zeno) Prompt: ([\s\S]*?)\]/);
  return match?.[1]?.trim() ?? null;
}

export function isPromptDrivenEntry(
  entry: { entry_type?: string; prompt_text?: string | null } | null | undefined,
  content: string,
): boolean {
  if (entry?.entry_type === 'prompt') return true;
  if (entry?.prompt_text?.trim()) return true;
  return !!extractJournalPromptText(content);
}

export function getPromptTextForEntry(
  entry: { prompt_text?: string | null } | null | undefined,
  content: string,
): string | null {
  const fromField = entry?.prompt_text?.trim();
  if (fromField) return fromField;
  return extractJournalPromptText(content);
}
