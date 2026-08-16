/** Category-aware emoji when a protocol has no custom emoji set. */
export function emojiForProtocol(title: string, category?: string, emoji?: string): string {
  if (emoji && emoji !== '📈' && emoji !== '📊') return emoji;

  const haystack = `${title} ${category ?? ''}`.toLowerCase();
  if (haystack.includes('friend')) return '🤝';
  if (haystack.includes('empathy') || haystack.includes('compassion')) return '💙';
  if (haystack.includes('valid')) return '✨';
  if (haystack.includes('gratitude') || haystack.includes('appreciat')) return '🙏';
  if (haystack.includes('sleep') || haystack.includes('rest')) return '😴';
  if (haystack.includes('anx') || haystack.includes('stress') || haystack.includes('calm')) return '🧘';
  if (haystack.includes('focus') || haystack.includes('productiv')) return '🎯';
  if (haystack.includes('social') || haystack.includes('connect')) return '🤝';
  if (haystack.includes('exercise') || haystack.includes('health')) return '💪';
  if (haystack.includes('routine') || haystack.includes('habit')) return '⚡';
  if (category === 'social') return '🤝';
  if (category === 'mindfulness') return '🧘';
  if (category === 'productivity') return '🎯';
  return emoji || '✨';
}

export function resolveProtocolTasks(
  tasks?: string[] | null,
  description?: string | null,
  title?: string | null,
): string[] {
  if (tasks && tasks.length > 0) return tasks;
  const trimmed = description?.trim();
  if (trimmed) return [trimmed];
  const titleTrimmed = title?.trim();
  return titleTrimmed ? [titleTrimmed] : [];
}
