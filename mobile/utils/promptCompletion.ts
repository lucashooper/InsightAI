import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'PROMPT_COMPLETED_DATE';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function markPromptCompletedToday(): Promise<void> {
  await AsyncStorage.setItem(KEY, todayKey());
}

export async function isPromptCompletedToday(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(KEY);
  return stored === todayKey();
}

export async function clearPromptCompletedToday(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
