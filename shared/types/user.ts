export type VoiceToneMode =
  | 'unfiltered_roast'
  | 'supportive_listener'
  | 'strict_psychologist';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  profile_picture_url: string;
  bio?: string;
  has_completed_welcome: boolean;
  encryption_enabled?: boolean;
  voice_tone_mode?: VoiceToneMode;
  created_at?: string;
  updated_at?: string;
}

export interface UsageLimit {
  canUse: boolean;
  remaining: number;
  limit: number;
  tier: 'free' | 'pro' | 'unlimited';
}

export type ActionType = 'ai_analysis' | 'probe_deeper';
