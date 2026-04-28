-- Add titles to existing Jonas demo entries
-- Run this to fix the "Untitled Entry" issue

UPDATE notes 
SET title = 'Tough feedback at work'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND content LIKE 'Had a really rough day at work%';

UPDATE notes 
SET title = 'Morning coffee reflection'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND content LIKE 'Spent the morning at the coffee%';

UPDATE notes 
SET title = 'Late night at the office'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND content LIKE 'Another late night working%';

UPDATE notes 
SET title = 'Morning walks helping'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND content LIKE 'Started a new habit this week%';

-- Verify it worked
SELECT id, title, mood, LEFT(content, 50) as preview 
FROM notes 
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
ORDER BY created_at DESC;
