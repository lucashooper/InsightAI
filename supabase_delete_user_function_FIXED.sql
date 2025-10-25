-- FIXED VERSION - Delete user account function
-- Run this in Supabase SQL Editor to replace the broken version

-- Drop the old function first
DROP FUNCTION IF EXISTS delete_user();

-- Create the corrected function
CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID from the JWT
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Delete user's profile (using the variable name, not function name)
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  
  -- Delete user's diary entries (if table exists)
  BEGIN
    DELETE FROM diary_entries WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist yet, skip
    NULL;
  END;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Account deleted successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
