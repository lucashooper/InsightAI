-- Fix Jonas demo account moods - Change from text to emojis
-- This fixes the truncated "anxio", "grate", "stres" display issue

UPDATE notes 
SET mood = '😰' -- anxious emoji
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = 'anxious';

UPDATE notes 
SET mood = '🙏' -- grateful emoji
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = 'grateful';

UPDATE notes 
SET mood = '😫' -- stressed emoji
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = 'stressed';

UPDATE notes 
SET mood = '🌟' -- hopeful emoji
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = 'hopeful';

-- Verify the fix
SELECT id, title, mood, LEFT(content, 50) as preview 
FROM notes 
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
ORDER BY created_at DESC;
