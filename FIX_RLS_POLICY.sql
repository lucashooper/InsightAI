-- ============================================
-- FIX: Allow Anonymous Analytics Events
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;

-- Create new policy that allows:
-- 1. Authenticated users to insert their own events (user_id matches auth.uid())
-- 2. Authenticated users to insert anonymous events (user_id is NULL)
CREATE POLICY "Users can insert their own analytics events"
ON analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Also need to allow ANON role to insert (for events before signup)
-- This is safe because we're only allowing inserts, not reads
CREATE POLICY "Allow anonymous event inserts"
ON analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Verify policies are created
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
WHERE tablename = 'analytics_events';
