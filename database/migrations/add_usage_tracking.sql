-- Add subscription tier to user_profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'unlimited'));
    END IF;
END $$;

-- Create usage_tracking table for AI analysis limits
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('ai_analysis', 'probe_deeper')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own usage
CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can insert their own usage" ON usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant unlimited tier to specific developer/tester emails
UPDATE user_profiles 
SET subscription_tier = 'unlimited' 
WHERE email IN ('edwardsjonny547@gmail.com', 'lucashooper100@outlook.com');

-- Create a function to check daily usage limit
CREATE OR REPLACE FUNCTION check_daily_usage_limit(
    p_user_id UUID,
    p_action_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_tier TEXT;
    v_limit INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO v_tier
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    -- Set limit based on tier
    IF v_tier = 'unlimited' THEN
        RETURN TRUE;
    ELSE
        v_limit := 2; -- 2 AI analyses per day for all users (free and pro)
    END IF;
    
    -- Count today's usage
    SELECT COUNT(*) INTO v_count
    FROM usage_tracking
    WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= CURRENT_DATE;
    
    -- Return true if under limit
    RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get remaining daily usage
CREATE OR REPLACE FUNCTION get_remaining_daily_usage(
    p_user_id UUID,
    p_action_type TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
    v_tier TEXT;
    v_limit INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO v_tier
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    -- Set limit based on tier
    IF v_tier = 'unlimited' THEN
        RETURN 999999; -- Effectively unlimited
    ELSE
        v_limit := 2; -- 2 AI analyses per day for all users (free and pro)
    END IF;
    
    -- Count today's usage
    SELECT COUNT(*) INTO v_count
    FROM usage_tracking
    WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= CURRENT_DATE;
    
    -- Return remaining
    RETURN GREATEST(0, v_limit - v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
