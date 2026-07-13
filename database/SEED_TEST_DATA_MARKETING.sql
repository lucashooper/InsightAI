-- =====================================================
-- MARKETING TEST DATA for edwardsjonny547+new@gmail.com
-- Run in Supabase SQL editor AFTER the account exists.
-- NOTE: Dashboard reads ai_structured_insights from Analyze in-app.
-- This seed only preloads journal text — analyze each entry in the app
-- for Emotional Landscape / Patterns to populate.
-- =====================================================

DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email = 'edwardsjonny547+new@gmail.com';

    IF test_user_id IS NULL THEN
        RAISE NOTICE 'User edwardsjonny547+new@gmail.com not found. Create the account first.';
        RETURN;
    END IF;

    DELETE FROM notes WHERE user_id = test_user_id;

    INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES
    (test_user_id, 'Morning gratitude', 'Woke up early and meditated for fifteen minutes. The sunrise through my window felt peaceful. I''m grateful for quiet mornings and how they set a calm tone for the day. Work went smoothly — I felt prepared and confident in my presentation. Planning a healthy dinner and calling my mom tonight.', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
    (test_user_id, 'Great evening with friends', 'Dinner with close friends was exactly what I needed. We laughed for hours and I left feeling energized, not drained. I forget how much connection lifts my mood. Grateful for people who make space for both deep talks and silly jokes.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (test_user_id, 'New project energy', 'Started a project I''m genuinely excited about. Creative energy is back and the team feels aligned. Reminded me why I care about this work — when purpose and values line up, everything feels lighter.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (test_user_id, 'Learning from mistakes', 'Caught a mistake before it snowballed. Old me would spiral into self-criticism; today I fixed it, documented what I learned, and moved on. Separating my worth from performance feels like real growth.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (test_user_id, 'Quiet restorative weekend', 'Slow Saturday — cleaning, meal prep, reading. I used to feel guilty about unproductive days, but rest is productive. I noticed I''m less irritable when I honor downtime.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    (test_user_id, 'Managing overwhelm', 'Three deadlines hit at once and anxiety spiked. I took a walk, broke tasks into smaller steps, and the panic eased. Still learning to catch spirals early — movement really helps me reset.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (test_user_id, 'Navigating conflict well', 'Tense conversation at work today. I paused, listened, and we found a better solution together. Conflict still makes me uncomfortable, but it doesn''t have to be destructive.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    (test_user_id, 'Sleep routine win', 'Stuck to my bedtime reading habit instead of scrolling. Slept better and woke up clearer. Small wins like finishing a book remind me I can follow through on things I care about.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    (test_user_id, 'Anxious but hopeful', 'Presentation nerves kicked in this morning. Heart racing, but I prepared well and it went fine. Anxiety is still there sometimes — I''m getting better at riding it out without avoiding what matters.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    (test_user_id, 'Proud of progress', 'Looked back at journal entries from last month — I handle stress differently now. More self-compassion, fewer catastrophic thoughts. Progress isn''t linear but it''s real.', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days');

    RAISE NOTICE 'Inserted 10 marketing entries for user %. Analyze each in the app to populate dashboard.', test_user_id;
END $$;
