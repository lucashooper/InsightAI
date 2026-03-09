-- Add AI consent tracking columns to user_profiles table
DO $$ 
BEGIN
    -- Add ai_consent_granted column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'ai_consent_granted'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN ai_consent_granted BOOLEAN DEFAULT NULL;
        COMMENT ON COLUMN user_profiles.ai_consent_granted IS 'Whether user has consented to AI analysis of their journal entries. NULL = not asked yet, TRUE = consented, FALSE = declined';
    END IF;

    -- Add ai_consent_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'ai_consent_date'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN ai_consent_date TIMESTAMPTZ DEFAULT NULL;
        COMMENT ON COLUMN user_profiles.ai_consent_date IS 'Timestamp when user made their AI consent decision';
    END IF;
END $$;
