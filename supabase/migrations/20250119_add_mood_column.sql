-- =====================================================
-- ADD MOOD COLUMN TO NOTES TABLE
-- =====================================================
-- This migration adds the 'mood' column to the notes table
-- to support emoji mood tracking in journal entries
-- =====================================================

-- Add mood column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'mood'
    ) THEN
        ALTER TABLE notes ADD COLUMN mood TEXT;
        
        -- Add index for faster mood-based queries
        CREATE INDEX IF NOT EXISTS idx_notes_mood ON notes(user_id, mood) WHERE mood IS NOT NULL;
        
        -- Add comment for documentation
        COMMENT ON COLUMN notes.mood IS 'Emoji representing the user''s mood for this journal entry';
    END IF;
END $$;
