-- ============================================
-- STEP 1: FIND THE USER ID
-- Run this first to get the user_id
-- ============================================

SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'insight@gmail.com';

-- Copy the 'id' value (it's a UUID like: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
-- Then use it in the next script below

-- ============================================
-- STEP 2: CREATE DEMO ACCOUNT WITH TEST ENTRIES
-- Replace YOUR_USER_ID_HERE with the actual UUID from above
-- ============================================

DO $$
DECLARE
    v_user_id UUID := '71051d55-c4b2-4332-b29e-800c69ad4f21'; -- Jonas demo account user ID
    v_entry1_id UUID := gen_random_uuid();
    v_entry2_id UUID := gen_random_uuid();
    v_entry3_id UUID := gen_random_uuid();
    v_entry4_id UUID := gen_random_uuid();
BEGIN

-- Create User Profile with Pro Access
INSERT INTO user_profiles (
    user_id,
    username,
    email,
    subscription_tier,
    created_at,
    updated_at
) VALUES (
    v_user_id,
    'Demo User',
    'insight@gmail.com',
    'pro',
    NOW() - INTERVAL '7 days',
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    subscription_tier = 'pro',
    email = 'insight@gmail.com',
    updated_at = NOW();

RAISE NOTICE '✅ Created user profile with Pro access';

-- Entry 1: Recent anxious entry WITH AI analysis (shows AI analysis capabilities)
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    ai_response_text,
    ai_insights,
    ai_structured_insights,
    ai_last_analyzed,
    created_at,
    updated_at
) VALUES (
    v_entry1_id,
    v_user_id,
    E'Had a really rough day at work today. My manager gave me feedback that felt pretty harsh, and I can''t stop replaying the conversation in my head. I know I should just move on, but I keep thinking about everything I could have said differently.\n\nThe worst part is feeling like I''m not good enough at what I do. Everyone else seems to have it together, and I''m just constantly second-guessing myself. I tried to focus on other tasks but my mind kept wandering back to that meeting.\n\nI feel anxious and a bit defeated. I know tomorrow is a new day, but right now it''s hard to shake this feeling.',
    'anxious',
    E'I can hear how much that feedback from your manager is weighing on you. It sounds like you''re caught in a cycle of rumination, replaying the conversation and mentally searching for what you "should have" said differently.\n\nHere''s what I notice: You''re experiencing a cognitive distortion called "mind reading" - assuming you know what your manager (and others) are thinking about your abilities. The belief that "everyone else has it together" is another distortion called "comparison" or "mental filtering," where you''re only noticing others'' strengths while magnifying your own perceived weaknesses.\n\nThe harsh truth is that one piece of feedback doesn''t define your competence. Your mind is treating this single event as evidence of a much bigger story ("I''m not good enough"), when in reality it''s just one moment in time.\n\nWhat might help: Can you identify one specific, actionable piece of feedback from that conversation that you can work on? This shifts you from rumination (going in circles) to problem-solving (moving forward). Also, notice when your mind says "everyone else" - that''s usually a sign you''re in comparison mode rather than seeing reality clearly.\n\nYou mentioned tomorrow is a new day. What would it look like to treat yourself tomorrow the way you''d treat a good friend who came to you with this same struggle?',
    jsonb_build_object(
        'mood_analysis', jsonb_build_object(
            'primary_emotion', 'Anxiety',
            'secondary_emotions', jsonb_build_array('Self-doubt', 'Rumination', 'Inadequacy'),
            'intensity', 7,
            'mood_trajectory', 'Declining in the moment, with awareness of potential for recovery'
        ),
        'cognitive_distortions', jsonb_build_array(
            jsonb_build_object('distortion', 'Mind Reading', 'evidence', 'Assuming the manager''s feedback means "you''re not good enough"'),
            jsonb_build_object('distortion', 'Mental Filtering', 'evidence', 'Focusing only on negative feedback'),
            jsonb_build_object('distortion', 'Comparison', 'evidence', 'Believing everyone else has it together'),
            jsonb_build_object('distortion', 'Rumination', 'evidence', 'Replaying the conversation repeatedly')
        ),
        'emotional_triggers', jsonb_build_array(
            'Critical feedback from authority figures',
            'Workplace performance concerns',
            'Comparison to others',
            'Perfectionism'
        )
    ),
    jsonb_build_object(
        'coping_suggestions', jsonb_build_array(
            'Extract one actionable insight from the feedback',
            'Practice self-compassion',
            'Physical reset: walk or breathing exercises',
            'Reality check: List 3 recent accomplishments',
            'Set a "worry time" to process feelings'
        )
    ),
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
);

RAISE NOTICE '✅ Created entry 1 (anxious) with AI analysis';

-- Entry 2: Grateful/reflective entry from yesterday
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at
) VALUES (
    v_entry2_id,
    v_user_id,
    E'Spent the morning at the coffee shop journaling and it felt really good to slow down. I''ve been so caught up in work stress that I forgot how much I enjoy these quiet moments.\n\nI''m grateful for my close friends who always check in on me, even when I get distant. Sarah texted me this morning just to say hi, and it reminded me that I have people who care.\n\nI want to be better about setting boundaries and not letting work consume all my energy. I deserve to have time for things that bring me joy, like reading, walking, and just being present.',
    'grateful',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

RAISE NOTICE '✅ Created entry 2 (grateful)';

-- Entry 3: Stressed entry from 3 days ago
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at
) VALUES (
    v_entry3_id,
    v_user_id,
    E'Another late night working. I told myself I''d leave at 6 PM but here I am at 9 PM still at my desk. I don''t even know if this extra work makes a difference or if I''m just spinning my wheels.\n\nI feel stressed and overwhelmed. There''s this constant pressure to prove myself and I don''t know how to turn it off. My shoulders are tense, I''m not sleeping well, and I snapped at my roommate earlier for no real reason.\n\nI need to figure out how to manage this better. I can''t keep going like this.',
    'stressed',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
);

RAISE NOTICE '✅ Created entry 3 (stressed)';

-- Entry 4: Hopeful entry from 5 days ago
INSERT INTO notes (
    id,
    user_id,
    content,
    mood,
    created_at,
    updated_at
) VALUES (
    v_entry4_id,
    v_user_id,
    E'Started a new habit this week - morning walks before work. Just 20 minutes around the block, but it''s made such a difference in how I feel going into the day.\n\nI''m feeling more hopeful lately. I think I''ve been so focused on what''s going wrong that I forgot to notice what''s going right. My project is actually coming together well, I got positive feedback from a client, and I''m sleeping better.\n\nMaybe things aren''t as bad as they feel in my head sometimes. I want to keep building on this momentum.',
    'hopeful',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
);

RAISE NOTICE '✅ Created entry 4 (hopeful)';

-- Track some analytics events
INSERT INTO analytics_events (user_id, session_id, event_name, properties, created_at)
VALUES 
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '2 hours'),
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '1 day'),
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '3 days'),
    (v_user_id, gen_random_uuid()::text, 'app_opened', '{}', NOW() - INTERVAL '5 days'),
    (v_user_id, gen_random_uuid()::text, 'journal_entry_created', '{}', NOW() - INTERVAL '2 hours'),
    (v_user_id, gen_random_uuid()::text, 'journal_entry_created', '{}', NOW() - INTERVAL '1 day'),
    (v_user_id, gen_random_uuid()::text, 'journal_entry_created', '{}', NOW() - INTERVAL '3 days'),
    (v_user_id, gen_random_uuid()::text, 'ai_analysis_completed', '{}', NOW() - INTERVAL '2 hours');

RAISE NOTICE '✅ Added analytics events';

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ DEMO ACCOUNT SETUP COMPLETE!';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE '📧 Credentials:';
RAISE NOTICE '   Email: insight@gmail.com';
RAISE NOTICE '   Password: InsightDemo';
RAISE NOTICE '';
RAISE NOTICE '🎯 Account includes:';
RAISE NOTICE '   ✅ Pro tier (unlimited AI scans)';
RAISE NOTICE '   ✅ 4 journal entries';
RAISE NOTICE '   ✅ 1 AI analysis ready to view';
RAISE NOTICE '   ✅ Natural usage history';
RAISE NOTICE '';

END $$;
