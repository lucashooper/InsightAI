-- IMPORTANT: Run check_user_and_notes.sql FIRST to identify the correct user_id
-- Then update the user_id values below before running this script!

-- Step 1: Find your current user_id
-- Look at the auth.users table and find the user_id for edwardsjonny547@gmail.com
-- Replace 'YOUR_ACTUAL_USER_ID_HERE' with the actual UUID from the auth.users table

-- Step 2: Update all orphaned notes to belong to you
-- OPTION A: If notes have NULL user_id, assign them to you
UPDATE notes
SET user_id = 'YOUR_ACTUAL_USER_ID_HERE'
WHERE user_id IS NULL;

-- OPTION B: If notes belong to an old/different user_id, reassign them
-- Replace 'OLD_USER_ID' with the user_id currently assigned to the notes
-- Replace 'YOUR_ACTUAL_USER_ID_HERE' with your current user_id
UPDATE notes
SET user_id = 'YOUR_ACTUAL_USER_ID_HERE'
WHERE user_id = 'OLD_USER_ID';

-- Step 3: Verify the update
SELECT 
  user_id,
  COUNT(*) as note_count
FROM notes
GROUP BY user_id;

-- Step 4: Check your notes now belong to you
SELECT 
  n.id,
  n.title,
  n.user_id,
  u.email
FROM notes n
JOIN auth.users u ON n.user_id = u.id
WHERE u.email = 'edwardsjonny547@gmail.com'
ORDER BY n.created_at DESC;
