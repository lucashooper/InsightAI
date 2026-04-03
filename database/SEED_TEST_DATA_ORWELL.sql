-- =====================================================
-- TEST DATA FOR coffeeappofficial@gmail.com
-- Marketing-optimized journal entries with balanced emotions
-- 60% positive/growth-oriented, 40% realistic challenges
-- =====================================================

-- First, get the user_id for coffeeappofficial@gmail.com
-- You'll need to run this after the user exists in auth.users
-- Replace 'USER_ID_HERE' with the actual UUID after creating the account

DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the user ID for coffeeappofficial@gmail.com
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'coffeeappofficial@gmail.com';

    -- If user doesn't exist, skip
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'User coffeeappofficial@gmail.com not found. Please create the account first.';
        RETURN;
    END IF;

    -- Delete existing notes for this user (clean slate)
    DELETE FROM notes WHERE user_id = test_user_id;

    -- Insert test journal entries (most recent first)
    
    -- Entry 1: Recent - Positive/Grateful (Today)
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Morning reflection',
        'Started the day with a 20-minute meditation and actually felt present for once. The sunrise was beautiful through my window. I''ve been practicing gratitude more consistently and I think it''s making a real difference in how I approach each day. Work presentation went better than expected - felt confident and prepared. Team gave positive feedback which felt really validating. Planning to cook a healthy dinner tonight and call mom.',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'grateful', 'intensity', 0.85),
                jsonb_build_object('emotion', 'calm', 'intensity', 0.75),
                jsonb_build_object('emotion', 'confident', 'intensity', 0.70)
            ),
            'themes', jsonb_build_array('self-care', 'mindfulness', 'work-success', 'relationships'),
            'sentiment_score', 0.82
        )
    );

    -- Entry 2: Yesterday - Mixed but hopeful
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Processing today',
        'Had a moment of overwhelm this afternoon when three deadlines hit at once. Took a break, went for a walk, and realized I was catastrophizing. Broke everything down into smaller tasks and suddenly it all felt manageable. Still learning to catch myself when anxiety starts spiraling. The walk really helped - need to remember that movement is medicine for me.',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'overwhelmed', 'intensity', 0.60),
                jsonb_build_object('emotion', 'hopeful', 'intensity', 0.70),
                jsonb_build_object('emotion', 'reflective', 'intensity', 0.75)
            ),
            'themes', jsonb_build_array('stress-management', 'self-awareness', 'coping-strategies'),
            'sentiment_score', 0.65
        )
    );

    -- Entry 3: 2 days ago - Positive/Social
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Great evening with friends',
        'Dinner with Sarah and Mike was exactly what I needed. We laughed so much my face hurt. It''s easy to isolate when I''m stressed, but tonight reminded me how much better I feel after connecting with people I care about. Grateful for friends who really get me and create space for both deep conversations and silly jokes. Left feeling energized instead of drained.',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'joyful', 'intensity', 0.90),
                jsonb_build_object('emotion', 'grateful', 'intensity', 0.85),
                jsonb_build_object('emotion', 'connected', 'intensity', 0.88)
            ),
            'themes', jsonb_build_array('social-connection', 'friendship', 'joy', 'self-awareness'),
            'sentiment_score', 0.88
        )
    );

    -- Entry 4: 3 days ago - Growth mindset
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Learning from mistakes',
        'Made an error in the project today that I caught before it became a bigger issue. Old me would have spiraled into self-criticism. Instead, I fixed it, documented what I learned, and moved on. This feels like real progress. I''m getting better at separating my worth from my performance. Mistakes are just information, not indictments.',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'proud', 'intensity', 0.75),
                jsonb_build_object('emotion', 'motivated', 'intensity', 0.70),
                jsonb_build_object('emotion', 'reflective', 'intensity', 0.80)
            ),
            'themes', jsonb_build_array('personal-growth', 'self-compassion', 'resilience', 'work'),
            'sentiment_score', 0.78
        )
    );

    -- Entry 5: 4 days ago - Mild challenge with resolution
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Navigating conflict',
        'Had a tense conversation with a coworker about project direction. Felt defensive at first but managed to pause and really listen to their perspective. We found common ground and actually came up with a better solution together. Conflict still makes me uncomfortable, but I''m learning it doesn''t have to be destructive. Communication is a skill I can keep improving.',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'anxious', 'intensity', 0.55),
                jsonb_build_object('emotion', 'relieved', 'intensity', 0.70),
                jsonb_build_object('emotion', 'accomplished', 'intensity', 0.65)
            ),
            'themes', jsonb_build_array('communication', 'conflict-resolution', 'work', 'growth'),
            'sentiment_score', 0.63
        )
    );

    -- Entry 6: 5 days ago - Positive/Achievement
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Finished the book!',
        'Finally completed that novel I''ve been reading for weeks. Felt so satisfying to actually finish something I started. I''ve been better about setting aside reading time before bed instead of scrolling. Sleep has been better too. Small wins like this remind me that I can follow through on things I care about.',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'satisfied', 'intensity', 0.80),
                jsonb_build_object('emotion', 'proud', 'intensity', 0.75),
                jsonb_build_object('emotion', 'content', 'intensity', 0.78)
            ),
            'themes', jsonb_build_array('self-care', 'accomplishment', 'healthy-habits', 'sleep'),
            'sentiment_score', 0.81
        )
    );

    -- Entry 7: 6 days ago - Reflective/Neutral
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Weekend thoughts',
        'Quiet Saturday. Did some cleaning, meal prep, caught up on emails. Nothing exciting but these maintenance days are important. I used to feel guilty about "unproductive" weekends, but rest is productive. My body and mind need downtime to recharge. Noticed I''m less irritable when I honor my need for slower days.',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'peaceful', 'intensity', 0.72),
                jsonb_build_object('emotion', 'reflective', 'intensity', 0.70),
                jsonb_build_object('emotion', 'content', 'intensity', 0.68)
            ),
            'themes', jsonb_build_array('rest', 'self-care', 'self-compassion', 'boundaries'),
            'sentiment_score', 0.70
        )
    );

    -- Entry 8: 1 week ago - Positive/Excited
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'New project kickoff',
        'Started working on something I''m genuinely excited about. It''s been a while since I felt this kind of creative energy. The team is great and the problem we''re solving actually matters. Reminded me why I got into this field in the first place. When work aligns with values, it doesn''t feel like work.',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'excited', 'intensity', 0.85),
                jsonb_build_object('emotion', 'motivated', 'intensity', 0.82),
                jsonb_build_object('emotion', 'inspired', 'intensity', 0.80)
            ),
            'themes', jsonb_build_array('work', 'purpose', 'creativity', 'passion'),
            'sentiment_score', 0.85
        )
    );

    -- Entry 9: 8 days ago - Challenge with insight
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Tough day but learning',
        'Felt really frustrated with myself today for procrastinating on an important task. Spent some time journaling about why I was avoiding it - realized it was fear of not doing it perfectly. Perfectionism is still my biggest obstacle. But at least I''m aware of it now. Awareness is the first step to change. Going to break the task into tiny pieces tomorrow.',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '8 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'frustrated', 'intensity', 0.65),
                jsonb_build_object('emotion', 'reflective', 'intensity', 0.75),
                jsonb_build_object('emotion', 'determined', 'intensity', 0.68)
            ),
            'themes', jsonb_build_array('self-awareness', 'perfectionism', 'procrastination', 'growth'),
            'sentiment_score', 0.58
        )
    );

    -- Entry 10: 9 days ago - Positive/Grateful
    INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_insights) VALUES (
        test_user_id,
        'Simple pleasures',
        'Morning coffee on the balcony. Birds chirping. No agenda. These moments of peace are what I''m working toward - not some distant future where everything is perfect, but the ability to be present and appreciate what''s here now. Gratitude practice is changing how I see my life. There''s so much good I was missing.',
        NOW() - INTERVAL '9 days',
        NOW() - INTERVAL '9 days',
        jsonb_build_object(
            'emotions', jsonb_build_array(
                jsonb_build_object('emotion', 'grateful', 'intensity', 0.88),
                jsonb_build_object('emotion', 'peaceful', 'intensity', 0.85),
                jsonb_build_object('emotion', 'content', 'intensity', 0.82)
            ),
            'themes', jsonb_build_array('gratitude', 'mindfulness', 'present-moment', 'joy'),
            'sentiment_score', 0.87
        )
    );

    RAISE NOTICE 'Successfully inserted 10 test journal entries for coffeeappofficial@gmail.com';
END $$;
