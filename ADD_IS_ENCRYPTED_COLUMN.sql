-- Add is_encrypted column to notes table
-- Run this in Supabase SQL Editor

-- Add the column (defaults to false for existing entries)
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;

-- Update existing entries to mark them as unencrypted (legacy)
UPDATE notes 
SET is_encrypted = false 
WHERE is_encrypted IS NULL;

-- Check the results
SELECT 
  COUNT(*) as total_entries,
  COUNT(CASE WHEN is_encrypted = true THEN 1 END) as encrypted_entries,
  COUNT(CASE WHEN is_encrypted = false THEN 1 END) as unencrypted_entries
FROM notes;

-- Sample entries to verify
SELECT 
  id,
  user_id,
  LEFT(content, 50) as content_preview,
  is_encrypted,
  created_at
FROM notes
ORDER BY created_at DESC
LIMIT 10;
