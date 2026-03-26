-- ============================================
-- INSIGHT ANALYTICS TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for anonymous events
  session_id TEXT, -- Track user sessions
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Composite index for common queries (user + event + time)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event_time 
ON analytics_events(user_id, event_name, created_at DESC);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own events (including anonymous onboarding events)
CREATE POLICY "Users can insert their own analytics events"
ON analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can view their own events
CREATE POLICY "Users can view their own analytics events"
ON analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admin can view all events (replace with your admin email)
CREATE POLICY "Admin can view all analytics events"
ON analytics_events
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'edwardsjonny547@gmail.com'
);

-- ============================================
-- ANALYTICS HELPER VIEWS
-- ============================================

-- View: Daily Active Users
CREATE OR REPLACE VIEW analytics_daily_active_users AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE event_name = 'app_opened'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Onboarding Funnel
CREATE OR REPLACE VIEW analytics_onboarding_funnel AS
SELECT 
  properties->>'step' as step,
  properties->>'step_number' as step_number,
  COUNT(DISTINCT user_id) as users,
  COUNT(*) as views
FROM analytics_events
WHERE event_name = 'onboarding_step_viewed'
GROUP BY properties->>'step', properties->>'step_number'
ORDER BY (properties->>'step_number')::int;

-- View: Onboarding Completion Rate
CREATE OR REPLACE VIEW analytics_onboarding_completion AS
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

-- View: Subscription Conversion
CREATE OR REPLACE VIEW analytics_subscription_conversion AS
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

-- View: Feature Usage
CREATE OR REPLACE VIEW analytics_feature_usage AS
SELECT 
  properties->>'feature' as feature,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_uses,
  DATE(created_at) as date
FROM analytics_events
WHERE event_name = 'feature_used'
GROUP BY properties->>'feature', DATE(created_at)
ORDER BY date DESC, total_uses DESC;

-- View: Recent Events (for debugging)
CREATE OR REPLACE VIEW analytics_recent_events AS
SELECT 
  id,
  user_id,
  event_name,
  properties,
  created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT 100;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Function: Get onboarding drop-off points
CREATE OR REPLACE FUNCTION get_onboarding_dropoff()
RETURNS TABLE (
  step TEXT,
  step_number INT,
  started BIGINT,
  completed BIGINT,
  drop_off_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH step_starts AS (
    SELECT 
      properties->>'step' as step,
      (properties->>'step_number')::int as step_number,
      COUNT(DISTINCT user_id) as users
    FROM analytics_events
    WHERE event_name = 'onboarding_step_viewed'
    GROUP BY properties->>'step', properties->>'step_number'
  ),
  step_completions AS (
    SELECT 
      properties->>'step' as step,
      (properties->>'step_number')::int as step_number,
      COUNT(DISTINCT user_id) as users
    FROM analytics_events
    WHERE event_name = 'onboarding_step_completed'
    GROUP BY properties->>'step', properties->>'step_number'
  )
  SELECT 
    s.step,
    s.step_number,
    s.users as started,
    COALESCE(c.users, 0) as completed,
    ROUND(100.0 * (s.users - COALESCE(c.users, 0)) / s.users, 2) as drop_off_rate
  FROM step_starts s
  LEFT JOIN step_completions c ON s.step = c.step AND s.step_number = c.step_number
  ORDER BY s.step_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user retention (7-day, 30-day)
CREATE OR REPLACE FUNCTION get_user_retention(days_ago INT DEFAULT 7)
RETURNS TABLE (
  cohort_date DATE,
  total_users BIGINT,
  returned_users BIGINT,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT 
      DATE(MIN(created_at)) as cohort_date,
      user_id
    FROM analytics_events
    WHERE event_name = 'app_opened'
    GROUP BY user_id
  ),
  returns AS (
    SELECT 
      c.cohort_date,
      c.user_id,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM analytics_events e
          WHERE e.user_id = c.user_id 
          AND e.event_name = 'app_opened'
          AND DATE(e.created_at) >= c.cohort_date + days_ago
          AND DATE(e.created_at) < c.cohort_date + days_ago + 1
        ) THEN 1 
        ELSE 0 
      END as returned
    FROM cohorts c
    WHERE c.cohort_date <= CURRENT_DATE - days_ago
  )
  SELECT 
    r.cohort_date,
    COUNT(*)::BIGINT as total_users,
    SUM(r.returned)::BIGINT as returned_users,
    ROUND(100.0 * SUM(r.returned) / COUNT(*), 2) as retention_rate
  FROM returns r
  GROUP BY r.cohort_date
  ORDER BY r.cohort_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant access to views for authenticated users
GRANT SELECT ON analytics_daily_active_users TO authenticated;
GRANT SELECT ON analytics_onboarding_funnel TO authenticated;
GRANT SELECT ON analytics_onboarding_completion TO authenticated;
GRANT SELECT ON analytics_subscription_conversion TO authenticated;
GRANT SELECT ON analytics_feature_usage TO authenticated;
GRANT SELECT ON analytics_recent_events TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_onboarding_dropoff() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_retention(INT) TO authenticated;

-- ============================================
-- SAMPLE QUERIES FOR ADMIN DASHBOARD
-- ============================================

-- Get onboarding funnel data
-- SELECT * FROM analytics_onboarding_funnel;

-- Get onboarding completion rate
-- SELECT * FROM analytics_onboarding_completion;

-- Get subscription conversion rate
-- SELECT * FROM analytics_subscription_conversion;

-- Get onboarding drop-off points
-- SELECT * FROM get_onboarding_dropoff();

-- Get 7-day retention
-- SELECT * FROM get_user_retention(7);

-- Get 30-day retention
-- SELECT * FROM get_user_retention(30);

-- Get daily active users for last 30 days
-- SELECT * FROM analytics_daily_active_users WHERE date >= CURRENT_DATE - 30;

-- Get feature usage for last 7 days
-- SELECT * FROM analytics_feature_usage WHERE date >= CURRENT_DATE - 7;

-- Get recent events (debugging)
-- SELECT * FROM analytics_recent_events;
