import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoDeeperMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

const draftKey = (userId: string) => `GO_DEEPER_DRAFT_${userId}`;
const entryKey = (userId: string, entryId: string) => `GO_DEEPER_${userId}_${entryId}`;

export async function loadGoDeeperConversation(
  userId: string,
  entryId?: string | null,
): Promise<GoDeeperMessage[]> {
  try {
    const key = entryId ? entryKey(userId, entryId) : draftKey(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GoDeeperMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveGoDeeperConversation(
  userId: string,
  messages: GoDeeperMessage[],
  entryId?: string | null,
): Promise<void> {
  const key = entryId ? entryKey(userId, entryId) : draftKey(userId);
  await AsyncStorage.setItem(key, JSON.stringify(messages));
}

export async function migrateDraftToEntry(userId: string, entryId: string): Promise<void> {
  const draft = await loadGoDeeperConversation(userId, null);
  if (draft.length === 0) return;

  const existing = await loadGoDeeperConversation(userId, entryId);
  if (existing.length === 0) {
    await saveGoDeeperConversation(userId, draft, entryId);
  }
  await AsyncStorage.removeItem(draftKey(userId));
}

export function createGoDeeperMessage(role: 'user' | 'assistant', content: string): GoDeeperMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
