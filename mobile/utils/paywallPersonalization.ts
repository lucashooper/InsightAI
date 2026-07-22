export function getFirstName(userName: string): string {
  const trimmed = userName?.trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export type GoalFocusKey = 'mood' | 'stress' | 'habits' | 'clarity' | 'default';

export function getGoalFocusKey(answers: Record<string, string>): GoalFocusKey {
  const goal = answers?.goal;
  if (goal === 'mood' || goal === 'stress' || goal === 'habits' || goal === 'clarity') {
    return goal;
  }
  return 'default';
}
