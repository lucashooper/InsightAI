import AsyncStorage from '@react-native-async-storage/async-storage';

export async function hasCheckInToday(): Promise<boolean> {
  try {
    const last = await AsyncStorage.getItem('lastMoodCheckIn');
    if (!last) return false;
    const lastDate = new Date(last);
    const today = new Date();
    return lastDate.toDateString() === today.toDateString();
  } catch {
    return false;
  }
}
