-- ============================================
-- Create a function to insert analytics events that bypasses RLS
-- This allows anonymous users to track events before signup
-- ============================================

-- Create function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION insert_analytics_event(
  p_user_id UUID,
  p_session_id TEXT,
  p_event_name TEXT,
  p_properties JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the owner (bypasses RLS)
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (user_id, session_id, event_name, properties)
  VALUES (p_user_id, p_session_id, p_event_name, p_properties)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION insert_analytics_event(UUID, TEXT, TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION insert_analytics_event(UUID, TEXT, TEXT, JSONB) TO authenticated;

-- Test it works
-- SELECT insert_analytics_event(NULL, 'test-session', 'test_event', '{"test": true}'::jsonb);
