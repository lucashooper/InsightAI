import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ProtocolReminder = {
  enabled: boolean;
  time: string; // HH:MM 24h
};

const storageKey = (strategyId: string) => `protocol_reminder_${strategyId}`;
const notificationIdKey = (strategyId: string) => `protocol_notif_id_${strategyId}`;

export async function loadProtocolReminder(strategyId: string): Promise<ProtocolReminder> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(strategyId));
    if (!raw) return { enabled: false, time: '09:00' };
    return JSON.parse(raw) as ProtocolReminder;
  } catch {
    return { enabled: false, time: '09:00' };
  }
}

export async function saveProtocolReminder(
  strategyId: string,
  title: string,
  reminder: ProtocolReminder,
): Promise<void> {
  await AsyncStorage.setItem(storageKey(strategyId), JSON.stringify(reminder));

  const existingId = await AsyncStorage.getItem(notificationIdKey(strategyId));
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
    await AsyncStorage.removeItem(notificationIdKey(strategyId));
  }

  if (!reminder.enabled) return;

  const [hourStr, minuteStr] = reminder.time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') return;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Protocol reminder',
      body: title ? `Time for: ${title}` : 'Time for your wellness protocol',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await AsyncStorage.setItem(notificationIdKey(strategyId), id);
}

export async function cancelProtocolReminder(strategyId: string): Promise<void> {
  const existingId = await AsyncStorage.getItem(notificationIdKey(strategyId));
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
    await AsyncStorage.removeItem(notificationIdKey(strategyId));
  }
  await AsyncStorage.removeItem(storageKey(strategyId));
}
