-- Step 1: Verify your current user_id (edwardsjonny / crupid)
SELECT 
  id as user_id,
  email,
  username,
  created_at
FROM user_profiles
WHERE email = 'edwardsjonny547@gmail.com' OR username = 'crupid';

-- Step 2: Count orphaned notes by user_id
SELECT 
  user_id,
  COUNT(*) as note_count,
  MIN(created_at) as oldest_note,
  MAX(updated_at) as newest_note
FROM notes
WHERE user_id NOT IN (SELECT id FROM user_profiles)
GROUP BY user_id
ORDER BY note_count DESC;

-- Step 3: REASSOCIATE YOUR ORPHANED NOTES
-- IMPORTANT: Only run this AFTER confirming the user_id from Step 1!
-- Replace 'YOUR_CURRENT_USER_ID' with the actual ID from Step 1

-- UPDATE notes
-- SET user_id = 'YOUR_CURRENT_USER_ID'
-- WHERE user_id = '8fa9b5be-12cc-4654-abaf-6395836d10de';

-- Step 4: For rwb44 - if those 3 notes are actually theirs, reassociate them
-- UPDATE notes
-- SET user_id = '8ea53e49-2ae7-43c2-9e33-3591b5079bd2'
-- WHERE user_id = '135862eb-0cfd-45ab-b3a4-9c0866333cbe';

-- Step 5: Verify the fix
-- SELECT 
--   up.username,
--   COUNT(n.id) as note_count
-- FROM user_profiles up
-- LEFT JOIN notes n ON up.id = n.user_id
-- GROUP BY up.id, up.username
-- ORDER BY note_count DESC;
