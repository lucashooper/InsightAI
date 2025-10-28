-- Find which user_id belongs to rwb44
SELECT 
  id as user_id,
  email,
  username,
  created_at
FROM user_profiles
WHERE username = 'rwb44';

-- Check all user profiles to see if rwb44 has multiple accounts
SELECT 
  id as user_id,
  email,
  username,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Match the user_ids from notes to their profiles
SELECT 
  up.username,
  up.email,
  up.id as user_id,
  COUNT(n.id) as note_count,
  STRING_AGG(n.title, ', ' ORDER BY n.updated_at DESC) as note_titles
FROM user_profiles up
LEFT JOIN notes n ON up.id = n.user_id
WHERE n.id IS NOT NULL
GROUP BY up.id, up.username, up.email
ORDER BY note_count DESC;
