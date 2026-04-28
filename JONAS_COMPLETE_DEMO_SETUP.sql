-- ============================================
-- CREATE JONAS DEMO ACCOUNT WITH TEST ENTRIES
-- Complete setup for influencer demo/feedback
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: First, create the user account manually in Supabase Dashboard
-- Go to: Authentication > Users > Add user manually
-- Email: demo.insight@gmail.com (or any email you want)
-- Password: InsightDemo2026!
-- Auto-confirm: YES
-- 
-- After creating, come back here and replace 'USER_ID_HERE' with the actual UUID

-- ============================================
-- CONFIGURATION
-- ============================================
-- Replace this with the actual user_id from auth.users after creating the account
DO $$
DECLARE
    v_user_id UUID := 'USER_ID_HERE'; -- REPLACE THIS WITH ACTUAL USER ID
    v_entry1_id UUID := gen_random_uuid();
    v_entry2_id UUID := gen_random_uuid();
    v_entry3_id UUID := gen_random_uuid();
    v_entry4_id UUID := gen_random_uuid();
BEGIN

-- ============================================
-- STEP 2: Create User Profile with Pro Access
-- ============================================
INSERT INTO user_profiles (
    user_id,
    username,
    subscription_tier,
    created_at,
    updated_at
) VALUES (
    v_user_id,
    'Demo User',
    'pro', -- Gives unlimited AI scans
    NOW() - INTERVAL '7 days', -- Account appears 7 days old
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    subscription_tier = 'pro',
    updated_at = NOW();

RAISE NOTICE '✅ Created user profile with Pro access';

-- ============================================
-- STEP 3: Create Test Journal Entries
-- These showcase different features of the app
-- ============================================

-- Entry 1: Recent anxious entry (shows AI analysis capabilities)
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at,
    entry_type
) VALUES (
    v_entry1_id,
    v_user_id,
    E'Had a really rough day at work today. My manager gave me feedback that felt pretty harsh, and I can''t stop replaying the conversation in my head. I know I should just move on, but I keep thinking about everything I could have said differently.\n\nThe worst part is feeling like I''m not good enough at what I do. Everyone else seems to have it together, and I''m just constantly second-guessing myself. I tried to focus on other tasks but my mind kept wandering back to that meeting.\n\nI feel anxious and a bit defeated. I know tomorrow is a new day, but right now it''s hard to shake this feeling.',
    'anxious',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    'general'
);

-- Entry 2: Grateful/reflective entry from yesterday (shows positive patterns)
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at,
    entry_type
) VALUES (
    v_entry2_id,
    v_user_id,
    E'Spent the morning at the coffee shop journaling and it felt really good to slow down. I''ve been so caught up in work stress that I forgot how much I enjoy these quiet moments.\n\nI''m grateful for my close friends who always check in on me, even when I get distant. Sarah texted me this morning just to say hi, and it reminded me that I have people who care.\n\nI want to be better about setting boundaries and not letting work consume all my energy. I deserve to have time for things that bring me joy, like reading, walking, and just being present.',
    'grateful',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    'gratitude'
);

-- Entry 3: Stressed entry from 3 days ago (shows pattern recognition)
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at,
    entry_type
) VALUES (
    v_entry3_id,
    v_user_id,
    E'Another late night working. I told myself I''d leave at 6 PM but here I am at 9 PM still at my desk. I don''t even know if this extra work makes a difference or if I''m just spinning my wheels.\n\nI feel stressed and overwhelmed. There''s this constant pressure to prove myself and I don''t know how to turn it off. My shoulders are tense, I''m not sleeping well, and I snapped at my roommate earlier for no real reason.\n\nI need to figure out how to manage this better. I can''t keep going like this.',
    'stressed',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    'general'
);

-- Entry 4: Hopeful entry from 5 days ago (shows emotional range)
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at,
    entry_type
) VALUES (
    v_entry4_id,
    v_user_id,
    E'Started a new habit this week - morning walks before work. Just 20 minutes around the block, but it''s made such a difference in how I feel going into the day.\n\nI''m feeling more hopeful lately. I think I''ve been so focused on what''s going wrong that I forgot to notice what''s going right. My project is actually coming together well, I got positive feedback from a client, and I''m sleeping better.\n\nMaybe things aren''t as bad as they feel in my head sometimes. I want to keep building on this momentum.',
    'hopeful',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    'general'
);

RAISE NOTICE '✅ Created 4 test journal entries';

-- ============================================
-- STEP 4: Add AI Analysis for Recent Entry
-- (This shows the AI analysis feature pre-populated)
-- ============================================

-- AI Analysis for Entry 1 (the anxious work entry)
INSERT INTO ai_responses (
    id,
    note_id,
    user_id,
    ai_response_text,
    mood_analysis,
    cognitive_distortions,
    coping_suggestions,
    emotional_triggers,
    created_at
) VALUES (
    gen_random_uuid(),
    v_entry1_id,
    v_user_id,
    E'I can hear how much that feedback from your manager is weighing on you. It sounds like you''re caught in a cycle of rumination, replaying the conversation and mentally searching for what you "should have" said differently.\n\nHere''s what I notice: You''re experiencing a cognitive distortion called "mind reading" - assuming you know what your manager (and others) are thinking about your abilities. The belief that "everyone else has it together" is another distortion called "comparison" or "mental filtering," where you''re only noticing others'' strengths while magnifying your own perceived weaknesses.\n\nThe harsh truth is that one piece of feedback doesn''t define your competence. Your mind is treating this single event as evidence of a much bigger story ("I''m not good enough"), when in reality it''s just one moment in time.\n\nWhat might help: Can you identify one specific, actionable piece of feedback from that conversation that you can work on? This shifts you from rumination (going in circles) to problem-solving (moving forward). Also, notice when your mind says "everyone else" - that''s usually a sign you''re in comparison mode rather than seeing reality clearly.\n\nYou mentioned tomorrow is a new day. What would it look like to treat yourself tomorrow the way you''d treat a good friend who came to you with this same struggle?',
    jsonb_build_object(
        'primary_emotion', 'Anxiety',
        'secondary_emotions', jsonb_build_array('Self-doubt', 'Rumination', 'Inadequacy'),
        'intensity', 7,
        'mood_trajectory', 'Declining in the moment, with awareness of potential for recovery'
    ),
    jsonb_build_array(
        jsonb_build_object('distortion', 'Mind Reading', 'evidence', 'Assuming the manager''s feedback means "you''re not good enough" without knowing their full perspective'),
        jsonb_build_object('distortion', 'Mental Filtering', 'evidence', 'Focusing only on this negative feedback while filtering out other positive accomplishments'),
        jsonb_build_object('distortion', 'Comparison', 'evidence', 'Believing everyone else has it together while you don''t, which is rarely the full truth'),
        jsonb_build_object('distortion', 'Rumination', 'evidence', 'Replaying the conversation repeatedly without reaching resolution')
    ),
    jsonb_build_array(
        'Extract one actionable insight from the feedback and create a concrete plan to address it',
        'Practice self-compassion: Write down what you''d tell a friend in this situation, then read it back to yourself',
        'Physical reset: Take a short walk, do breathing exercises, or engage in movement to interrupt the rumination cycle',
        'Reality check: List 3 recent accomplishments at work to counter the "not good enough" narrative',
        'Set a "worry time" - give yourself 15 minutes to process this, then consciously redirect your attention'
    ),
    jsonb_build_array(
        'Critical feedback from authority figures',
        'Workplace performance concerns',
        'Comparison to others',
        'Perfectionism and self-judgment'
    ),
    NOW() - INTERVAL '2 hours'
);

RAISE NOTICE '✅ Added AI analysis for recent entry';

-- ============================================
-- STEP 5: Track Some Analytics Events
-- (Shows the app has been "used" naturally)
-- ============================================

INSERT INTO analytics_events (user_id, session_id, event_name, properties, created_at)
VALUES 
    -- App opens over the past week
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '2 hours'),
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '1 day'),
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '3 days'),
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '5 days'),
    
    -- Journal entries created
    (v_user_id, gen_random_uuid()::text, 'journal_entry_created', jsonb_build_object('entry_type', 'general'), NOW() - INTERVAL '2 hours'),
    (v_user_id, gen_random_uuid()::text, 'journal_entry_created', jsonb_build_object('entry_type', 'gratitude'), NOW() - INTERVAL '1 day'),
    (v_user_id, gen_random_uuid()::text, 'journal_entry_created', jsonb_build_object('entry_type', 'general'), NOW() - INTERVAL '3 days'),
    
    -- AI analysis used
    (v_user_id, gen_random_uuid()::text, 'ai_analysis_completed', '{}', NOW() - INTERVAL '2 hours');

RAISE NOTICE '✅ Added analytics events';

-- ============================================
-- FINAL SUCCESS MESSAGE
-- ============================================
RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ DEMO ACCOUNT SETUP COMPLETE';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE '📧 Demo Account Credentials:';
RAISE NOTICE '   Email: demo.insight@gmail.com (or whatever you set)';
RAISE NOTICE '   Password: InsightDemo2026!';
RAISE NOTICE '';
RAISE NOTICE '🎯 Account Features:';
RAISE NOTICE '   ✅ Pro tier (unlimited AI scans)';
RAISE NOTICE '   ✅ 4 pre-populated journal entries';
RAISE NOTICE '   ✅ 1 AI analysis ready to view';
RAISE NOTICE '   ✅ Analytics data showing natural usage';
RAISE NOTICE '';
RAISE NOTICE '📱 What Jonas Will See:';
RAISE NOTICE '   1. Recent anxious entry with AI analysis';
RAISE NOTICE '   2. Grateful entry from yesterday';
RAISE NOTICE '   3. Stressed entry from 3 days ago';
RAISE NOTICE '   4. Hopeful entry from 5 days ago';
RAISE NOTICE '';
RAISE NOTICE '🔥 He can:';
RAISE NOTICE '   - Scan entries to see AI analysis';
RAISE NOTICE '   - View mind bubbles and patterns';
RAISE NOTICE '   - Create new entries';
RAISE NOTICE '   - Delete test entries if desired';
RAISE NOTICE '   - Experience full premium features';
RAISE NOTICE '';
RAISE NOTICE '========================================';

END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup worked:

-- Check user profile
-- SELECT user_id, username, subscription_tier, created_at 
-- FROM user_profiles 
-- WHERE subscription_tier = 'pro';

-- Check journal entries
-- SELECT id, mood, created_at, LEFT(content, 50) as content_preview
-- FROM notes
-- WHERE user_id = 'USER_ID_HERE'
-- ORDER BY created_at DESC;

-- Check AI analysis
-- SELECT note_id, LEFT(ai_response_text, 100) as analysis_preview, created_at
-- FROM ai_responses
-- WHERE user_id = 'USER_ID_HERE';

-- ============================================
-- INSTRUCTIONS FOR YOU:
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Users > Add user
--    Email: demo.insight@gmail.com (or whatever you prefer)
--    Password: InsightDemo2026!
--    Auto Confirm User: YES
--
-- 2. Copy the user_id (UUID) from the newly created user
--
-- 3. Replace 'USER_ID_HERE' at the top of this script with that UUID
--
-- 4. Run this entire script in SQL Editor
--
-- 5. Send Jonas the credentials:
--    Email: demo.insight@gmail.com
--    Password: InsightDemo2026!
--
-- 6. When he logs in, he'll see:
--    - 4 journal entries already there
--    - 1 entry with AI analysis ready
--    - Full premium features unlocked
--    - Can immediately explore all functionality
--
-- ============================================
