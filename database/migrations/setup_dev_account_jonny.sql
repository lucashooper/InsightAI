-- Founder dev account: edwardsjonny547@gmail.com
-- Run in Supabase Dashboard → SQL Editor (instant fix — no edge deploy required)

UPDATE user_profiles
SET
  subscription_tier = 'unlimited',
  email = 'edwardsjonny547@gmail.com',
  updated_at = NOW()
WHERE lower(email) = 'edwardsjonny547@gmail.com';

INSERT INTO user_profiles (user_id, username, email, subscription_tier, created_at, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email,
  'unlimited',
  NOW(),
  NOW()
FROM auth.users
WHERE lower(email) = 'edwardsjonny547@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'unlimited',
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify
SELECT user_id, username, email, subscription_tier
FROM user_profiles
WHERE lower(email) = 'edwardsjonny547@gmail.com';
