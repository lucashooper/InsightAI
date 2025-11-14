import { createClient } from '@supabase/supabase-js';

// Get environment variables (works for both web and mobile)
const getEnvVar = (key: string): string => {
  // For web (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] as string;
  }
  // For React Native (will be configured separately)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] as string;
  }
  throw new Error(`Environment variable ${key} is not defined`);
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
