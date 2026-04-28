-- ============================================
-- CLEANUP SCRIPT FOR DEMO ACCOUNT
-- Run this if you need to start fresh
-- ============================================

-- First, get the user_id
SELECT id, email FROM auth.users WHERE email = 'insight@gmail.com';

-- Then replace YOUR_USER_ID_HERE below with that id and run this:

DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS
BEGIN
    -- Delete all data for this user
    DELETE FROM ai_responses WHERE user_id = v_user_id;
    DELETE FROM notes WHERE user_id = v_user_id;
    DELETE FROM analytics_events WHERE user_id = v_user_id;
    DELETE FROM user_profiles WHERE user_id = v_user_id;
    
    RAISE NOTICE '✅ Cleaned up all data for user';
END $$;

-- After running cleanup, run the main JONAS_DEMO_SIMPLE.sql script again
