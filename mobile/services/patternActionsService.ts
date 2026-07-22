import AsyncStorage from '@react-native-async-storage/async-storage';

export type PatternActionStatus = 'working' | 'dismissed' | 'resolved';

export type PatternAction = {
  status: PatternActionStatus;
  updatedAt: string;
  snoozeUntil?: string;
  summary: string;
};

const STORAGE_KEY = '@zeno_pattern_actions';
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

export function getPatternKey(summary: string): string {
  return summary.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 160);
}

export async function loadPatternActions(): Promise<Record<string, PatternAction>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export async function savePatternActions(actions: Record<string, PatternAction>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

export async function setPatternAction(summary: string, status: PatternActionStatus): Promise<Record<string, PatternAction>> {
  const actions = await loadPatternActions();
  const key = getPatternKey(summary);
  const next: PatternAction = {
    status,
    updatedAt: new Date().toISOString(),
    summary,
    ...(status === 'dismissed' ? { snoozeUntil: new Date(Date.now() + SNOOZE_MS).toISOString() } : {}),
  };
  actions[key] = next;
  await savePatternActions(actions);
  return actions;
}

export async function clearPatternAction(summary: string): Promise<Record<string, PatternAction>> {
  const actions = await loadPatternActions();
  const key = getPatternKey(summary);
  delete actions[key];
  await savePatternActions(actions);
  return actions;
}

export function isPatternHidden(action: PatternAction | undefined): boolean {
  if (!action) return false;
  if (action.status === 'working' || action.status === 'resolved') return true;
  if (action.status === 'dismissed' && action.snoozeUntil) {
    return new Date(action.snoozeUntil) > new Date();
  }
  return false;
}

export function isPatternWorking(action: PatternAction | undefined): boolean {
  return action?.status === 'working';
}
