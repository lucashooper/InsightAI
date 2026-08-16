/** Heuristic: gratitude practice rows are stored in `notes` without a dedicated entry_type. */
export function isGratitudeEntry(
  entry: { title?: string | null; mood?: string | null; content?: string | null },
  gratitudeTitle?: string,
): boolean {
  const title = entry.title?.trim() ?? '';
  const content = entry.content ?? '';
  if (gratitudeTitle && title === gratitudeTitle) return true;
  if (entry.mood === '🙏') return true;
  if (content.includes('🙏') && (title.toLowerCase().includes('gratitude') || content.toLowerCase().includes('gratitude'))) {
    return true;
  }
  return false;
}
