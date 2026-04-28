-- ============================================
-- CREATE DEMO ACCOUNT FOR INFLUENCER (JONAS)
-- Gives 3 AI analyses per day instead of 2
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the demo user account
-- NOTE: You'll need to create this user through Supabase Auth Dashboard first:
-- Email: jonas.demo@insightai.app (or whatever you prefer)
-- Password: DemoInsight2026! (or whatever you prefer)
-- Then get the user_id from auth.users table and update below

-- Step 2: Create/Update user profile with special tier
-- Replace 'JONAS_USER_ID_HERE' with the actual UUID from auth.users
INSERT INTO user_profiles (
  user_id,
  username,
  subscription_tier,
  created_at,
  updated_at
) VALUES (
  'JONAS_USER_ID_HERE', -- Replace with actual user_id
  'Jonas Demo',
  'demo', -- Special demo tier
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  subscription_tier = 'demo',
  updated_at = NOW();

-- Step 3: Create a function to check demo tier limits (3 per day)
CREATE OR REPLACE FUNCTION check_usage_limit_demo(
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
    ELSIF v_tier = 'demo' THEN
        v_limit := 3; -- 3 AI analyses per day for demo accounts
    ELSIF v_tier = 'pro' THEN
        RETURN TRUE; -- Pro users have unlimited
    ELSE
        v_limit := 2; -- 2 AI analyses per day for free users
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

-- Step 4: Verify the setup
-- Run this to check the demo user's tier:
-- SELECT user_id, username, subscription_tier, created_at 
-- FROM user_profiles 
-- WHERE user_id = 'JONAS_USER_ID_HERE';

-- Step 5: Test usage check
-- SELECT check_usage_limit_demo('JONAS_USER_ID_HERE', 'ai_analysis');

-- ============================================
-- ALTERNATIVE: Add email to app's DEMO_EMAILS array
-- ============================================
-- If you prefer to handle this in the app code instead of database,
-- you can add Jonas's email to EntryDetailScreen.tsx:
-- 
-- const DEMO_EMAILS = ['jonas@jonasdietrich.com']; // or whatever his email is
-- const isDemoUser = DEMO_EMAILS.includes(userEmail);
-- const dailyLimit = isDemoUser ? 3 : (isAdmin ? 10 : 2);
-- ============================================

COMMENT ON FUNCTION check_usage_limit_demo(UUID, TEXT) IS 
'Checks if user has reached their daily usage limit. Demo tier gets 3 analyses per day.';
