-- ============================================
-- ADD DELETE POLICY FOR ANALYTICS EVENTS
-- Run this in Supabase SQL Editor
-- ============================================

-- Allow admin to delete analytics events
CREATE POLICY "Admin can delete analytics events"
ON analytics_events
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'edwardsjonny547@gmail.com'
);

-- Verify all policies on analytics_events table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'analytics_events'
ORDER BY cmd, policyname;
