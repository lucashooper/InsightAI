-- ============================================
-- CORRECT FIX - Use auth.users ID, not user_profiles ID
-- ============================================

-- Step 1: Find rwb44's ACTUAL user_id from auth.users (not user_profiles)
SELECT 
  au.id as auth_user_id,
  au.email,
  up.id as profile_id,
  up.username
FROM auth.users au
LEFT JOIN user_profiles up ON au.email = up.email
WHERE au.email = 'richardwilliamb@icloud.com';

-- Step 2: Find YOUR auth user_id
SELECT 
  au.id as auth_user_id,
  au.email,
  up.id as profile_id,
  up.username
FROM auth.users au
LEFT JOIN user_profiles up ON au.email = up.email
WHERE au.email = 'edwardsjonny547@gmail.com';

-- Step 3: Check which user_ids are in auth.users
SELECT 
  n.user_id,
  COUNT(*) as note_count,
  au.email,
  CASE 
    WHEN au.id IS NULL THEN 'NOT IN auth.users'
    ELSE 'Valid auth user'
  END as status
FROM notes n
LEFT JOIN auth.users au ON n.user_id = au.id
GROUP BY n.user_id, au.email
ORDER BY note_count DESC;

-- Step 4: After confirming the correct auth.users IDs from Steps 1-2, run these:
-- (Replace with actual IDs from the queries above)

-- Fix rwb44's notes (use their auth.users ID)
-- UPDATE notes
-- SET user_id = 'RWBS_AUTH_USER_ID_FROM_STEP_1'
-- WHERE user_id = '135862eb-0cfd-45ab-b3a4-9c0866333cbe';

-- Fix your notes (use your auth.users ID)
-- UPDATE notes  
-- SET user_id = 'YOUR_AUTH_USER_ID_FROM_STEP_2'
-- WHERE user_id = '8fa9b5be-12cc-4654-abaf-6395836d10de';
