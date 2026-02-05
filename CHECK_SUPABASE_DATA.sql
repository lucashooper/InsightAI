-- Run this query in Supabase SQL Editor to check entry encryption status

-- Check edwardsjonny's entries
SELECT 
  id,
  user_id,
  title,
  LEFT(content, 100) as content_preview,
  LENGTH(content) as content_length,
  created_at,
  updated_at
FROM notes
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%edwardsjonny%' OR email LIKE '%jonny%'
)
ORDER BY created_at DESC
LIMIT 10;

-- Check if content looks encrypted (contains "U2FsdGVk" which is base64 for "Salted")
SELECT 
  COUNT(*) as total_entries,
  COUNT(CASE WHEN content LIKE 'U2FsdGVk%' THEN 1 END) as encrypted_entries,
  COUNT(CASE WHEN content NOT LIKE 'U2FsdGVk%' THEN 1 END) as plain_text_entries
FROM notes;

-- Sample of recent entries to see format
SELECT 
  id,
  LEFT(content, 50) as content_start,
  created_at
FROM notes
ORDER BY created_at DESC
LIMIT 5;
