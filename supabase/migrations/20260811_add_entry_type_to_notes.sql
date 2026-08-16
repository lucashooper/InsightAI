-- Prompt reflections use the notes table (not diary_entries).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notes' AND column_name = 'entry_type'
    ) THEN
        ALTER TABLE notes ADD COLUMN entry_type TEXT DEFAULT 'regular';
        CREATE INDEX IF NOT EXISTS idx_notes_entry_type ON notes(user_id, entry_type);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notes' AND column_name = 'prompt_text'
    ) THEN
        ALTER TABLE notes ADD COLUMN prompt_text TEXT;
    END IF;
END $$;
