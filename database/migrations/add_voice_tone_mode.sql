-- Vent Mode: persist user's preferred voice interaction tone on user_profiles.
-- Run in Supabase SQL editor or via migration pipeline.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS voice_tone_mode TEXT
  DEFAULT 'supportive_listener'
  CHECK (voice_tone_mode IN ('unfiltered_roast', 'supportive_listener', 'strict_psychologist'));

COMMENT ON COLUMN public.user_profiles.voice_tone_mode IS
  'Vent Mode tone: unfiltered_roast | supportive_listener | strict_psychologist';
