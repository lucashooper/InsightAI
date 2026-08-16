-- ============================================
-- DAVID DEMO ACCOUNT — run in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk/sql/new
--
-- Login in app: david@insight.app / David123
-- (or username: David)
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_email TEXT := 'david@insight.app';
  v_password TEXT := 'David123';
  v_username TEXT := 'David';
  v_user_id UUID;
  v_encrypted_pw TEXT := crypt(v_password, gen_salt('bf'));
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      NOW(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('username', v_username),
      NOW(),
      NOW(),
      false,
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      v_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created auth user %', v_email;
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_pw,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmation_token = COALESCE(confirmation_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      recovery_token = COALESCE(recovery_token, ''),
      updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE 'User already existed — password reset to David123';
  END IF;

  INSERT INTO public.user_profiles (
    user_id,
    username,
    email,
    subscription_tier,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_username,
    v_email,
    'unlimited',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    subscription_tier = 'unlimited',
    updated_at = NOW();

  RAISE NOTICE 'Done. user_id = %', v_user_id;
END $$;

-- Verify
SELECT u.id, u.email, u.email_confirmed_at IS NOT NULL AS email_confirmed,
       p.username, p.subscription_tier
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE u.email = 'david@insight.app';
