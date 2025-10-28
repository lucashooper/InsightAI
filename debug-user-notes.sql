-- Debug script for user rwb44's notes issue
-- This will help identify where the notes are stored and why they're not showing

-- 1. Find the user's ID and profile info
SELECT 
  id as user_id,
  email,
  username,
  created_at
FROM user_profiles
WHERE username = 'rwb44';

-- 2. Count notes associated with this user in the notes table
SELECT 
  COUNT(*) as total_notes,
  user_id
FROM notes
WHERE user_id IN (
  SELECT id FROM user_profiles WHERE username = 'rwb44'
)
GROUP BY user_id;

-- 3. Get all notes for this user with details
SELECT 
  n.id,
  n.user_id,
  n.title,
  n.created_at,
  n.updated_at,
  LENGTH(n.content) as content_length,
  n.mood_score,
  n.ai_insights
FROM notes n
WHERE n.user_id IN (
  SELECT id FROM user_profiles WHERE username = 'rwb44'
)
ORDER BY n.updated_at DESC;

-- 4. Check if there are any orphaned notes (notes without a valid user_id)
SELECT 
  id,
  user_id,
  title,
  created_at,
  updated_at
FROM notes
WHERE user_id IS NULL
   OR user_id NOT IN (SELECT id FROM user_profiles)
ORDER BY updated_at DESC
LIMIT 10;

-- 5. Check for notes that might be associated with a different user_id
-- (in case the user logged in with a different account)
SELECT 
  up.username,
  up.email,
  COUNT(n.id) as note_count
FROM user_profiles up
LEFT JOIN notes n ON up.id = n.user_id
GROUP BY up.id, up.username, up.email
HAVING COUNT(n.id) > 0
ORDER BY note_count DESC;
