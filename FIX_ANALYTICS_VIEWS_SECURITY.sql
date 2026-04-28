-- ============================================
-- FIX ANALYTICS VIEWS SECURITY DEFINER ISSUE
-- This removes SECURITY DEFINER and replaces with SECURITY INVOKER
-- Views will now respect RLS policies on analytics_events table
-- ============================================

-- Drop existing views
DROP VIEW IF EXISTS analytics_daily_active_users;
DROP VIEW IF EXISTS analytics_onboarding_funnel;
DROP VIEW IF EXISTS analytics_onboarding_completion;
DROP VIEW IF EXISTS analytics_subscription_conversion;
DROP VIEW IF EXISTS analytics_feature_usage;
DROP VIEW IF EXISTS analytics_recent_events;

-- Recreate View: Daily Active Users (SECURITY INVOKER)
CREATE OR REPLACE VIEW analytics_daily_active_users 
WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE event_name = 'app_opened'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Recreate View: Onboarding Funnel (SECURITY INVOKER)
CREATE OR REPLACE VIEW analytics_onboarding_funnel 
WITH (security_invoker = true) AS
SELECT 
  properties->>'step' as step,
  properties->>'step_number' as step_number,
  COUNT(DISTINCT user_id) as users,
  COUNT(*) as views
FROM analytics_events
WHERE event_name = 'onboarding_step_viewed'
GROUP BY properties->>'step', properties->>'step_number'
ORDER BY (properties->>'step_number')::int;

-- Recreate View: Onboarding Completion Rate (SECURITY INVOKER)
CREATE OR REPLACE VIEW analytics_onboarding_completion 
WITH (security_invoker = true) AS
SELECT 
  COUNT(DISTINCT CASE WHEN event_name = 'onboarding_started' THEN user_id END) as started,
  COUNT(DISTINCT CASE WHEN event_name = 'onboarding_completed' THEN user_id END) as completed,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'onboarding_completed' THEN user_id END) / 
    NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'onboarding_started' THEN user_id END), 0),
    2
  ) as completion_rate_percent
FROM analytics_events
WHERE event_name IN ('onboarding_started', 'onboarding_completed');

-- Recreate View: Subscription Conversion (SECURITY INVOKER)
CREATE OR REPLACE VIEW analytics_subscription_conversion 
WITH (security_invoker = true) AS
SELECT 
  COUNT(DISTINCT CASE WHEN event_name = 'paywall_viewed' THEN user_id END) as paywall_views,
  COUNT(DISTINCT CASE WHEN event_name = 'subscription_purchased' THEN user_id END) as purchases,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'subscription_purchased' THEN user_id END) / 
    NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'paywall_viewed' THEN user_id END), 0),
    2
  ) as conversion_rate_percent
FROM analytics_events
WHERE event_name IN ('paywall_viewed', 'subscription_purchased');

-- Recreate View: Feature Usage (SECURITY INVOKER)
CREATE OR REPLACE VIEW analytics_feature_usage 
WITH (security_invoker = true) AS
SELECT 
  properties->>'feature' as feature,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_uses,
  DATE(created_at) as date
FROM analytics_events
WHERE event_name = 'feature_used'
GROUP BY properties->>'feature', DATE(created_at)
ORDER BY date DESC, total_uses DESC;

-- Recreate View: Recent Events (SECURITY INVOKER)
CREATE OR REPLACE VIEW analytics_recent_events 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  event_name,
  properties,
  created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT 100;

-- Re-grant permissions to authenticated users
GRANT SELECT ON analytics_daily_active_users TO authenticated;
GRANT SELECT ON analytics_onboarding_funnel TO authenticated;
GRANT SELECT ON analytics_onboarding_completion TO authenticated;
GRANT SELECT ON analytics_subscription_conversion TO authenticated;
GRANT SELECT ON analytics_feature_usage TO authenticated;
GRANT SELECT ON analytics_recent_events TO authenticated;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all views are now SECURITY INVOKER:
-- 
-- SELECT 
--   schemaname,
--   viewname,
--   viewowner,
--   definition
-- FROM pg_views
-- WHERE schemaname = 'public' 
-- AND viewname LIKE 'analytics_%'
-- ORDER BY viewname;
--
-- Look for 'security_invoker=true' in the definition
-- ============================================

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics views have been recreated with SECURITY INVOKER';
  RAISE NOTICE '✅ Views will now respect RLS policies on analytics_events table';
  RAISE NOTICE '✅ Regular users will only see their own analytics data';
  RAISE NOTICE '✅ Admin (edwardsjonny547@gmail.com) will see all data via RLS policy';
END $$;
