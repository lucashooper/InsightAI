import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function readSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const url =
      Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      'https://placeholder.supabase.co';
    const anonKey =
      Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      'placeholder-key';
    return { url, anonKey };
  } catch (err) {
    console.warn('[supabase] Config read failed, using placeholders:', err);
    return { url: 'https://placeholder.supabase.co', anonKey: 'placeholder-key' };
  }
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = readSupabaseConfig();

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ Supabase credentials not configured. App will run in demo mode.');
}

let supabaseClient: ReturnType<typeof createClient>;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        Prefer: 'return=representation',
      },
    },
  });
} catch (err) {
  console.error('[supabase] Client init failed, using placeholder client:', err);
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: { storage: AsyncStorage, autoRefreshToken: false, persistSession: false },
  });
}

export const supabase = supabaseClient;
