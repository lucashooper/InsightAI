-- ============================================
-- COMPLETE FIX FOR USER ID AND ORPHANED NOTES
-- ============================================

-- PART 1: Fix rwb44's issue
-- Reassociate the 3 orphaned notes to rwb44's actual account
UPDATE notes
SET user_id = '8ea53e49-2ae7-43c2-9e33-3591b5079bd2'
WHERE user_id = '135862eb-0cfd-45ab-b3a4-9c0866333cbe';

-- PART 2: Clean up other orphaned notes
-- Delete notes from deleted/non-existent users (except the ones we just fixed)
DELETE FROM notes
WHERE user_id NOT IN (SELECT id FROM user_profiles)
  AND user_id != '8fa9b5be-12cc-4654-abaf-6395836d10de'; -- Keep your 26 notes for now

-- PART 3: Add CASCADE DELETE to prevent future orphaned notes
-- This ensures when a user deletes their account, their notes are also deleted

-- First, check the current foreign key constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'notes' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Drop the old foreign key constraint (replace 'constraint_name' with actual name from above query)
-- ALTER TABLE notes DROP CONSTRAINT notes_user_id_fkey;

-- Add new foreign key with CASCADE DELETE
-- ALTER TABLE notes
-- ADD CONSTRAINT notes_user_id_fkey 
-- FOREIGN KEY (user_id) 
-- REFERENCES user_profiles(id) 
-- ON DELETE CASCADE;

-- PART 4: Verify the fix
SELECT 
  up.username,
  up.email,
  COUNT(n.id) as note_count
FROM user_profiles up
LEFT JOIN notes n ON up.id = n.user_id
WHERE up.username IN ('rwb44', 'crupid', 'orwell', 'remetest', 'jasperman')
GROUP BY up.id, up.username, up.email
ORDER BY note_count DESC;

-- PART 5: Check for any remaining orphaned notes
SELECT COUNT(*) as orphaned_count
FROM notes
WHERE user_id NOT IN (SELECT id FROM user_profiles);
