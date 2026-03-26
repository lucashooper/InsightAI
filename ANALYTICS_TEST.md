# Testing Analytics Setup

## Quick Test

After reloading your app, run this query in Supabase SQL Editor to see if events are being tracked:

```sql
SELECT 
  event_name,
  properties,
  session_id,
  user_id,
  created_at
FROM analytics_events
ORDER BY created_at DESC
LIMIT 20;
```

## What You Should See

After going through onboarding, you should see events like:
- `onboarding_step_viewed` (with step name and number in properties)
- `onboarding_step_completed`
- `paywall_viewed` (if you reached paywall)

## If No Events Appear

1. Check the table exists:
```sql
SELECT * FROM analytics_events LIMIT 1;
```

2. Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'analytics_events';
```

3. Check the app logs for `[Analytics]` messages

## Update Required

You need to re-run the SQL script because I updated it to:
1. Allow `user_id` to be NULL (for anonymous onboarding events)
2. Updated RLS policy to allow inserting events with NULL user_id

**Run this in Supabase SQL Editor:**
```sql
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;

-- Recreate with updated policy
CREATE POLICY "Users can insert their own analytics events"
ON analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

Then reload your app and test again!
