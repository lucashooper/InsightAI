-- =====================================================
-- ADD ENTRY_TYPE COLUMN TO DIARY_ENTRIES TABLE
-- =====================================================
-- This migration adds the 'entry_type' column to support
-- different types of entries (regular, prompt-based, etc.)
-- =====================================================

-- Add entry_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'diary_entries' AND column_name = 'entry_type'
    ) THEN
        ALTER TABLE diary_entries ADD COLUMN entry_type TEXT DEFAULT 'regular';
        
        -- Add index for faster filtering by entry type
        CREATE INDEX IF NOT EXISTS idx_diary_entries_entry_type ON diary_entries(user_id, entry_type);
        
        -- Add comment for documentation
        COMMENT ON COLUMN diary_entries.entry_type IS 'Type of entry: regular, prompt, etc.';
    END IF;
END $$;

-- Add prompt_text column if it doesn't exist (for storing the original prompt)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'diary_entries' AND column_name = 'prompt_text'
    ) THEN
        ALTER TABLE diary_entries ADD COLUMN prompt_text TEXT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN diary_entries.prompt_text IS 'Original prompt text for prompt-based entries';
    END IF;
END $$;
