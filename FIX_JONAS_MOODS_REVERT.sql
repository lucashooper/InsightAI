-- Revert Jonas moods back to text values (not emojis)
-- The app UI will handle displaying the emoji based on the text value

UPDATE notes 
SET mood = 'hopeful'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = '🌟';

UPDATE notes 
SET mood = 'stressed'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = '😫';

UPDATE notes 
SET mood = 'grateful'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = '🙏';

UPDATE notes 
SET mood = 'anxious'
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
AND mood = '😰';

-- Verify the fix
SELECT id, title, mood, LEFT(content, 50) as preview 
FROM notes 
WHERE user_id = '71051d55-c4b2-4332-b29e-800c69ad4f21'
ORDER BY created_at DESC;
