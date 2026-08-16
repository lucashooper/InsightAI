-- Investor demo: millie@app.com (David's APK persona)
-- Run in Supabase Dashboard → SQL Editor

UPDATE user_profiles
SET
  subscription_tier = 'unlimited',
  username = COALESCE(NULLIF(username, ''), 'Millie Smith'),
  email = 'millie@app.com',
  updated_at = NOW()
WHERE user_id = 'a0c3ba5b-c584-48a2-b297-0feaa726fb83'
   OR lower(email) = 'millie@app.com';

INSERT INTO user_profiles (user_id, username, email, subscription_tier, created_at, updated_at)
SELECT
  id,
  'Millie Smith',
  'millie@app.com',
  'unlimited',
  NOW(),
  NOW()
FROM auth.users
WHERE lower(email) = 'millie@app.com'
ON CONFLICT (user_id) DO UPDATE SET
  subscription_tier = 'unlimited',
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Confirm email if login fails after password reset
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = 'millie@app.com';

SELECT user_id, username, email, subscription_tier
FROM user_profiles
WHERE lower(email) = 'millie@app.com';
