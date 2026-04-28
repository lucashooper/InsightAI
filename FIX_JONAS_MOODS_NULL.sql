-- Option: Remove mood from right side by setting to NULL
-- This will only show the emoji icon on the left, no text on right

UPDATE notes 
SET mood = NULL
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21';

-- Verify
SELECT id, title, mood, LEFT(content, 50) as preview 
FROM notes 
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
ORDER BY created_at DESC;

-- Alternative: Check if empty string works better
-- UPDATE notes SET mood = '' WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21';
