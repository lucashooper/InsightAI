import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  VENT_LOCAL_TONE_KEY,
  VENT_TONE_MODES,
  type VoiceToneMode,
} from '../constants/ventVoice';

const DEFAULT_TONE: VoiceToneMode = 'supportive_listener';

function isValidTone(value: unknown): value is VoiceToneMode {
  return typeof value === 'string' && VENT_TONE_MODES.includes(value as VoiceToneMode);
}

let cachedTone: VoiceToneMode | null = null;

export async function loadVentVoiceTone(): Promise<VoiceToneMode> {
  if (cachedTone) return cachedTone;

  try {
    const local = await AsyncStorage.getItem(VENT_LOCAL_TONE_KEY);
    if (isValidTone(local)) {
      cachedTone = local;
      return local;
    }
  } catch {
    // fall through
  }

  cachedTone = DEFAULT_TONE;
  return DEFAULT_TONE;
}

export async function saveVentVoiceTone(tone: VoiceToneMode): Promise<void> {
  cachedTone = tone;
  await AsyncStorage.setItem(VENT_LOCAL_TONE_KEY, tone);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ voice_tone_mode: tone, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      console.warn('[ventVoicePreferences] Supabase sync skipped:', error.message);
    }
  } catch (err) {
    console.warn('[ventVoicePreferences] Supabase sync failed:', err);
  }
}

/** Pull remote preference when local cache is empty or on screen mount. */
export async function syncVentVoiceToneFromProfile(): Promise<VoiceToneMode> {
  const local = await loadVentVoiceTone();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return local;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('voice_tone_mode')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data?.voice_tone_mode || !isValidTone(data.voice_tone_mode)) {
      return local;
    }

    if (data.voice_tone_mode !== local) {
      cachedTone = data.voice_tone_mode;
      await AsyncStorage.setItem(VENT_LOCAL_TONE_KEY, data.voice_tone_mode);
    }

    return data.voice_tone_mode;
  } catch {
    return local;
  }
}
