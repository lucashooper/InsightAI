-- Create a function to delete the current user's account
-- This needs to be run in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the current user's ID from the JWT
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Delete user's profile
  DELETE FROM user_profiles WHERE user_profiles.user_id = delete_user.user_id;
  
  -- Delete user's diary entries (if table exists, skip error if it doesn't)
  BEGIN
    DELETE FROM diary_entries WHERE diary_entries.user_id = delete_user.user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist yet, skip
    NULL;
  END;
  
  -- Delete the auth user (this requires the function to be SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = user_id;
  
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
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account';
