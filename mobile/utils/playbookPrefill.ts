import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@zeno_playbook_prefill';

type Prefill = {
  title: string;
  description: string;
};

export async function setPlaybookPrefill(title: string, description: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ title, description }));
}

export async function consumePlaybookPrefill(): Promise<Prefill | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed?.title) return null;
    return parsed as Prefill;
  } catch {
    return null;
  }
}
