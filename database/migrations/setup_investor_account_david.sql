-- ============================================
-- DAVID DEMO ACCOUNT (Android investor APK)
-- Run AFTER: node scripts/provision-investor-account.js
-- Or create auth user in Supabase Dashboard first, then run this SQL.
-- ============================================

-- Login: david@insight.app  |  Password: David123  |  Username: David

UPDATE user_profiles
SET
  subscription_tier = 'unlimited',
  username = COALESCE(NULLIF(username, ''), 'David'),
  email = 'david@insight.app',
  updated_at = NOW()
WHERE email IN ('david@insight.app', 'david.investor@insightdemo.app')
   OR user_id IN (SELECT id FROM auth.users WHERE email IN ('david@insight.app', 'david.investor@insightdemo.app'));

INSERT INTO user_profiles (user_id, username, email, subscription_tier, created_at, updated_at)
SELECT
  id,
  'David',
  email,
  'unlimited',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'david@insight.app'
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'unlimited',
  username = 'David',
  email = EXCLUDED.email,
  updated_at = NOW();

SELECT user_id, username, email, subscription_tier
FROM user_profiles
WHERE email = 'david@insight.app';
