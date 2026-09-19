-- ============================================
-- JAY DEMO ACCOUNT + SAMPLE JOURNAL DATA
-- Run in Supabase SQL Editor after pgcrypto is enabled.
--
-- Login: jay@insight.app / Jay123
-- Name: Jay Leung | Tier: pro
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_email TEXT := 'jay@insight.app';
  v_password TEXT := 'Jay123';
  v_username TEXT := 'Jay Leung';
  v_user_id UUID;
  v_encrypted_pw TEXT := crypt(v_password, gen_salt('bf'));
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, is_sso_user,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      v_email, v_encrypted_pw, NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('username', v_username),
      NOW(), NOW(), false, '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_user_id, v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email', v_user_id::text, NOW(), NOW(), NOW()
    );

    RAISE NOTICE 'Created auth user %', v_email;
  ELSE
    UPDATE auth.users
    SET encrypted_password = v_encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = v_user_id;
    RAISE NOTICE 'User exists — password reset to Jay123';
  END IF;

  INSERT INTO public.user_profiles (user_id, username, email, subscription_tier, created_at, updated_at)
  VALUES (v_user_id, v_username, v_email, 'pro', NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    subscription_tier = 'pro',
    updated_at = NOW();

  -- Fresh demo journal entries (plain text — no encryption for easy Expo Go demos)
  DELETE FROM notes WHERE user_id = v_user_id;

  INSERT INTO notes (user_id, title, content, created_at, updated_at, ai_structured_insights) VALUES
  (v_user_id, 'Morning clarity',
   'Woke up early and took a slow walk before work. The air felt fresh and I noticed small things I usually rush past. I felt hopeful about the day instead of dreading my inbox. I want to keep this ritual — it changed my mood completely.',
   NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours',
   jsonb_build_object(
     'wellbeingScore', 8,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'hopeful',
       'secondary_emotions', jsonb_build_array('calm', 'grateful'),
       'energy_level', 'medium',
       'intensity', 7
     ),
     'key_insights', jsonb_build_array('Morning walks reliably lift your mood before work stress hits')
   )),
  (v_user_id, 'Work stress, but coping',
   'A deadline moved up and I felt tense by afternoon. Instead of spiralling, I stepped away for ten minutes, drank water, and wrote down what I could control. I finished the most important task and let the rest wait.',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
   jsonb_build_object(
     'wellbeingScore', 6,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'stressed',
       'secondary_emotions', jsonb_build_array('proud', 'tired'),
       'energy_level', 'low',
       'intensity', 6
     ),
     'key_insights', jsonb_build_array('Short breaks help you reset when deadlines stack up')
   )),
  (v_user_id, 'Great evening with friends',
   'Dinner with close friends was exactly what I needed. We laughed for hours and I left feeling energized, not drained. I forget how much connection lifts my mood.',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
   jsonb_build_object(
     'wellbeingScore', 9,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'joyful',
       'secondary_emotions', jsonb_build_array('grateful', 'connected'),
       'energy_level', 'high',
       'intensity', 8
     ),
     'key_insights', jsonb_build_array('Social connection is a strong mood booster for you')
   )),
  (v_user_id, 'Learning from mistakes',
   'Caught a mistake before it snowballed. Old me would spiral into self-criticism; today I fixed it, documented what I learned, and moved on. Separating my worth from performance feels like real growth.',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
   jsonb_build_object(
     'wellbeingScore', 7,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'proud',
       'secondary_emotions', jsonb_build_array('reflective'),
       'energy_level', 'medium',
       'intensity', 6
     ),
     'key_insights', jsonb_build_array('Self-compassion after mistakes is improving over time')
   )),
  (v_user_id, 'Quiet restorative weekend',
   'Slow Saturday — cleaning, meal prep, reading. I used to feel guilty about unproductive days, but rest is productive. I am less irritable when I honor downtime.',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days',
   jsonb_build_object(
     'wellbeingScore', 7,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'calm',
       'secondary_emotions', jsonb_build_array('content'),
       'energy_level', 'medium',
       'intensity', 5
     ),
     'key_insights', jsonb_build_array('Rest days reduce irritability later in the week')
   )),
  (v_user_id, 'Managing overwhelm',
   'Three deadlines hit at once and anxiety spiked. I took a walk, broke tasks into smaller steps, and the panic eased. Movement really helps me reset.',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
   jsonb_build_object(
     'wellbeingScore', 5,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'anxious',
       'secondary_emotions', jsonb_build_array('hopeful'),
       'energy_level', 'low',
       'intensity', 7
     ),
     'key_insights', jsonb_build_array('Walking breaks interrupt anxiety spirals when workload spikes')
   )),
  (v_user_id, 'Sleep routine win',
   'Stuck to my bedtime reading habit instead of scrolling. Slept better and woke up clearer. Small wins remind me I can follow through.',
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days',
   jsonb_build_object(
     'wellbeingScore', 8,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'rested',
       'secondary_emotions', jsonb_build_array('proud'),
       'energy_level', 'high',
       'intensity', 6
     ),
     'key_insights', jsonb_build_array('Evening screen limits improve next-day clarity')
   )),
  (v_user_id, 'Proud of progress',
   'Looked back at journal entries from last month — I handle stress differently now. More self-compassion, fewer catastrophic thoughts. Progress is not linear but it is real.',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days',
   jsonb_build_object(
     'wellbeingScore', 8,
     'analysis_locale', 'en',
     'mood_analysis', jsonb_build_object(
       'primary_emotion', 'grateful',
       'secondary_emotions', jsonb_build_array('hopeful', 'proud'),
       'energy_level', 'medium',
       'intensity', 7
     ),
     'key_insights', jsonb_build_array('Your stress response has softened over the past month')
   ));

  RAISE NOTICE 'Jay demo ready. user_id = %, 8 journal entries with dashboard insights.', v_user_id;
END $$;

SELECT u.id, u.email, p.username, p.subscription_tier,
       (SELECT count(*) FROM notes n WHERE n.user_id = u.id) AS note_count
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE u.email = 'jay@insight.app';
