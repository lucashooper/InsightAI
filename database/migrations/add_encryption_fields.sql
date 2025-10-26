-- Add encryption fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS encryption_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_salt TEXT,
ADD COLUMN IF NOT EXISTS encryption_test_payload TEXT;

-- Add encrypted_content column to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS encrypted_content TEXT;

-- Create index for faster queries on encrypted notes
CREATE INDEX IF NOT EXISTS idx_notes_encrypted_content ON notes(user_id) WHERE encrypted_content IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN user_profiles.encryption_enabled IS 'Whether user has enabled end-to-end encryption';
COMMENT ON COLUMN user_profiles.encryption_salt IS 'Base64 encoded salt for password-based key derivation';
COMMENT ON COLUMN user_profiles.encryption_test_payload IS 'Encrypted test data for password verification';
COMMENT ON COLUMN notes.encrypted_content IS 'JSON string containing encrypted note data (title, content, ai_insights)';
