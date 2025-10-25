-- Run this in Supabase SQL Editor to check user IDs and notes

-- 1. Check all users and their emails
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check all notes and which user they belong to
SELECT 
  id as note_id,
  user_id,
  title,
  created_at,
  updated_at
FROM notes
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check if any notes have NULL or orphaned user_id
SELECT 
  COUNT(*) as count,
  user_id
FROM notes
GROUP BY user_id;

-- 4. Find notes that might not belong to any current user
SELECT n.*
FROM notes n
LEFT JOIN auth.users u ON n.user_id = u.id
WHERE u.id IS NULL;
