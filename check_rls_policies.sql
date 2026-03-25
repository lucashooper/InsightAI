-- Check RLS policies on actionable_insights table
-- This might be blocking the tasks column from being inserted

-- View all policies on the table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'actionable_insights';

-- Check if RLS is enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'actionable_insights';

-- Check table permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'actionable_insights';
