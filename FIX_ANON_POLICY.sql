-- ============================================
-- FIX: Enable ANON role to insert analytics events
-- The issue is that anon users need permission to insert
-- ============================================

-- First, verify the table has RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'analytics_events';

-- Grant INSERT permission to anon role on the table itself
GRANT INSERT ON analytics_events TO anon;

-- Note: No sequence grant needed - table uses gen_random_uuid() for ID

-- Verify the grants
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'analytics_events';

-- Test: This should now work
-- INSERT INTO analytics_events (session_id, event_name, properties) 
-- VALUES ('test-session', 'test_event', '{}');
