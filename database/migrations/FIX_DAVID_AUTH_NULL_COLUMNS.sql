-- ============================================
-- FIX: "Database error querying schema" on login
-- Run this in Supabase SQL Editor if david@insight.app won't sign in.
-- Cause: auth.users token columns must be '' not NULL when created via SQL.
-- ============================================

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  recovery_token = COALESCE(recovery_token, '')
WHERE lower(email) = 'david@insight.app';

-- Verify no NULL token columns remain
SELECT email,
  confirmation_token IS NULL AS bad_confirmation,
  email_change IS NULL AS bad_email_change,
  email_change_token_new IS NULL AS bad_email_change_new,
  recovery_token IS NULL AS bad_recovery
FROM auth.users
WHERE lower(email) = 'david@insight.app';
