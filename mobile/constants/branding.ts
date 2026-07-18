/** User-facing app brand name. */
export const APP_NAME = 'Zeno';

/** Display name for the premium tier (RevenueCat entitlement IDs stay unchanged). */
export const PRO_DISPLAY_NAME = 'Zeno Pro';

/** Prefix stored in journal entries for guided prompts. */
export const JOURNAL_PROMPT_PREFIX = 'Zeno Prompt';

/** Matches legacy Insight Prompt tags and new Zeno Prompt tags. */
export const JOURNAL_PROMPT_TAG_REGEX = /\[(?:Insight|Zeno) Prompt: ([^\]]+)\]/g;

export const JOURNAL_PROMPT_STRIP_REGEX = /\[(?:Insight|Zeno) Prompt: [^\]]+\]\n\n/;

export function formatJournalPromptContent(promptText: string, content: string): string {
  return `[${JOURNAL_PROMPT_PREFIX}: ${promptText}]\n\n${content}`;
}

export function stripJournalPromptTag(content: string): string {
  return content.replace(JOURNAL_PROMPT_STRIP_REGEX, '').trim();
}

export function extractJournalPromptText(content: string): string | null {
  const match = content.match(/\[(?:Insight|Zeno) Prompt: ([^\]]+)\]/);
  return match?.[1] ?? null;
}
