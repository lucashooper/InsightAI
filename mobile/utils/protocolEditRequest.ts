import AsyncStorage from '@react-native-async-storage/async-storage';

const EDIT_PROTOCOL_KEY = '@insight_edit_protocol_id';

export async function requestProtocolEdit(protocolId: string): Promise<void> {
  await AsyncStorage.setItem(EDIT_PROTOCOL_KEY, protocolId);
}

export async function consumeProtocolEditRequest(): Promise<string | null> {
  try {
    const id = await AsyncStorage.getItem(EDIT_PROTOCOL_KEY);
    if (id) await AsyncStorage.removeItem(EDIT_PROTOCOL_KEY);
    return id;
  } catch {
    return null;
  }
}
