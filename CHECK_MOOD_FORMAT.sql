-- Check what mood format YOUR entries use (to match the correct format)
-- Run this to see how moods are stored in your actual entries

SELECT 
    user_id,
    mood,
    title,
    created_at
FROM notes 
WHERE user_id != '71051d55-c4b2-4332-b29e-800c69ad4f21' -- Exclude Jonas demo account
ORDER BY created_at DESC 
LIMIT 10;

-- This will show us what format your real entries use for the mood field
