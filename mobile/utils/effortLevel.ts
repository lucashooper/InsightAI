export type EffortLevel = 'quick_win' | 'mindset_shift' | 'deep_routine';

export function inferEffortLevel(text: string): EffortLevel {
  const lower = text.toLowerCase();
  if (
    ['routine', 'schedule', 'habit', 'consistent', 'daily', 'weekly', 'structure'].some((w) =>
      lower.includes(w),
    )
  ) {
    return 'deep_routine';
  }
  if (
    ['reflect', 'mindset', 'perspective', 'reframe', 'notice', 'aware', 'accept', 'gentle'].some(
      (w) => lower.includes(w),
    )
  ) {
    return 'mindset_shift';
  }
  return 'quick_win';
}

export function normalizeEffortLevel(value: unknown): EffortLevel {
  if (value === 'quick_win' || value === 'mindset_shift' || value === 'deep_routine') {
    return value;
  }
  return 'quick_win';
}

export function effortMatchesFilter(
  effort: EffortLevel | undefined,
  filter: 'all' | 'quick_win' | 'mindset' | 'archived',
): boolean {
  if (filter === 'archived') return false;
  if (filter === 'all') return true;
  if (filter === 'quick_win') return effort === 'quick_win';
  return effort === 'mindset_shift' || effort === 'deep_routine';
}
