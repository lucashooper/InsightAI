-- ============================================
-- FINAL DIAGNOSIS - The notes are CORRECT!
-- ============================================

-- rwb44's IDs:
-- auth.users.id = 135862eb-0cfd-45ab-b3a4-9c0866333cbe (what notes table uses)
-- user_profiles.id = 8ea53e49-2ae7-43c2-9e33-3591b5079bd2 (what we were checking)

-- Verify rwb44's 3 notes are correctly associated
SELECT 
  n.id,
  n.title,
  n.user_id,
  au.email,
  up.username
FROM notes n
JOIN auth.users au ON n.user_id = au.id
LEFT JOIN user_profiles up ON au.email = up.email
WHERE au.email = 'richardwilliamb@icloud.com'
ORDER BY n.updated_at DESC;

-- Check YOUR notes
SELECT 
  au.id as auth_user_id,
  au.email,
  up.id as profile_id,
  up.username
FROM auth.users au
LEFT JOIN user_profiles up ON au.email = up.email
WHERE au.email = 'edwardsjonny547@gmail.com';

-- Count notes by auth user
SELECT 
  au.email,
  up.username,
  COUNT(n.id) as note_count
FROM auth.users au
LEFT JOIN user_profiles up ON au.email = up.email
LEFT JOIN notes n ON au.id = n.user_id
GROUP BY au.id, au.email, up.username
HAVING COUNT(n.id) > 0
ORDER BY note_count DESC;

-- THE REAL ISSUE: Check what getNotes() is querying
-- The app code uses: .eq('user_id', user.id)
-- But user.id comes from Supabase auth, which should be auth.users.id
-- So the query SHOULD work correctly!

-- Verify: Does the app's getNotes() filter work?
SELECT 
  n.id,
  n.title,
  n.user_id
FROM notes n
WHERE n.user_id = '135862eb-0cfd-45ab-b3a4-9c0866333cbe'  -- rwb44's auth.users.id
ORDER BY n.updated_at DESC;
