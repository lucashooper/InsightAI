-- ========================================
-- SUPABASE SQL QUERIES TO FIX ACCOUNT ISSUES
-- ========================================
-- Run these in: Supabase Dashboard → SQL Editor
-- ========================================

-- 1. VIEW ALL USER ACCOUNTS
-- This shows all your accounts in order of creation
-- The FIRST one is your original account
SELECT 
  user_id, 
  username, 
  email, 
  created_at,
  has_completed_welcome
FROM user_profiles 
ORDER BY created_at ASC;

-- Expected Output:
-- user_id                              | username   | email                | created_at
-- -------------------------------------+------------+----------------------+------------------
-- abc123-original-user-id...           | Coffeeman  | original@email.com   | 2025-xx-xx (older)
-- def456-new-user-id...                | Coffeeman  | new@email.com        | 2025-xx-xx (newer)


-- ========================================
-- 2. FIX ORIGINAL ACCOUNT USERNAME
-- ========================================
-- Replace 'YOUR_ORIGINAL_USER_ID' with the user_id from query #1
-- (the one with the OLDER created_at date)

UPDATE user_profiles 
SET username = 'crupid'
WHERE user_id = '8fa9b5be-12cc-4654-abaf-6395836d10de';

-- After running, verify:
SELECT user_id, username, email FROM user_profiles;

-- Should show:
-- abc123...  | crupid     | original@email.com
-- def456...  | Coffeeman  | new@email.com


-- ========================================
-- 3. CHECK FOR DUPLICATE USERNAMES (Optional)
-- ========================================
-- This finds any duplicate usernames
SELECT username, COUNT(*) as count
FROM user_profiles
GROUP BY username
HAVING COUNT(*) > 1;

-- If you see duplicates, one account needs a different username


-- ========================================
-- 4. VIEW ALL AUTH USERS (Verification)
-- ========================================
-- This shows all authenticated users
-- Should match your user_profiles
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at,
  raw_user_meta_data->>'username' as username_metadata
FROM auth.users 
ORDER BY created_at ASC;


-- ========================================
-- 5. DELETE A USER COMPLETELY (CAUTION!)
-- ========================================
-- Only use if you want to permanently delete an account
-- This is IRREVERSIBLE!

-- Step 1: Delete profile data
-- DELETE FROM user_profiles WHERE user_id = 'USER_ID_TO_DELETE';

-- Step 2: Delete all notes for that user
-- DELETE FROM notes WHERE user_id = 'USER_ID_TO_DELETE';

-- Step 3: Delete auth user (do this in Dashboard → Authentication → Users)
-- Click the user → Delete User


-- ========================================
-- 6. RESET WELCOME SCREEN (Optional)
-- ========================================
-- If you want to see the welcome screen again
-- UPDATE user_profiles 
-- SET has_completed_welcome = false
-- WHERE user_id = 'YOUR_USER_ID';


-- ========================================
-- 7. VIEW NOTES BY USER (Verify Separation)
-- ========================================
-- Check which user owns which notes
SELECT 
  n.id,
  n.title,
  n.created_at,
  p.username,
  p.email
FROM notes n
LEFT JOIN user_profiles p ON n.user_id = p.user_id
ORDER BY n.created_at DESC
LIMIT 20;

-- This should show notes properly separated by user


-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Find user by email:
-- SELECT * FROM user_profiles WHERE email = 'your@email.com';

-- Find user by username:
-- SELECT * FROM user_profiles WHERE username = 'crupid';

-- Check if email is confirmed:
-- SELECT id, email, email_confirmed_at 
-- FROM auth.users 
-- WHERE email = 'your@email.com';
