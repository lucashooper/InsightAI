# Insight Analytics System

## Overview
Insight uses a custom Supabase-based analytics system to track user behavior, onboarding conversion, and key metrics. This is simpler, free, and more integrated than third-party solutions like PostHog.

## Setup Instructions

### 1. Run the SQL Script in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `/Users/lucas/Desktop/InsightAI/SUPABASE_ANALYTICS_SETUP.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run** to create the tables, views, and functions

This will create:
- `analytics_events` table with proper indexes
- Helper views for common queries (DAU, funnel, conversion, etc.)
- Functions for drop-off analysis and retention
- Row-level security policies (admin can see all, users see their own)

### 2. Verify the Setup

Run this query in Supabase SQL Editor to verify:
```sql
SELECT * FROM analytics_recent_events LIMIT 10;
```

If it returns an empty result (no error), you're good to go!

## What Gets Tracked

### Core Events
- `app_opened` - User opens the app (tracked on sign in)
- `onboarding_started` - User begins onboarding
- `onboarding_step_viewed` - User views an onboarding step
- `onboarding_step_completed` - User completes an onboarding step
- `onboarding_completed` - User finishes onboarding
- `paywall_viewed` - User sees subscription paywall
- `subscription_started` - User purchases subscription
- `feature_used` - User uses a specific feature

### Additional Events
- `user_signed_up` - New account created
- `user_signed_in` - User logs in
- `user_signed_out` - User logs out
- `journal_entry_created` - Journal entry created
- `ai_chat_opened` - AI chat opened
- `ai_chat_message_sent` - Message sent to AI
- `dashboard_viewed` - Dashboard viewed
- `theme_changed` - Theme changed

## How It Works

### Mobile App
The analytics service (`/mobile/services/analytics.ts`) automatically tracks events to Supabase:

```typescript
import { analytics } from '../services/analytics';

// Track a custom event
analytics.track('feature_used', { feature: 'journal_voice_note' });

// Track onboarding
analytics.trackOnboardingStep('name_input', 1);
analytics.trackOnboardingStepCompleted('name_input', 1);

// Track paywall
analytics.trackPaywallViewed('onboarding_end');

// Track subscription
analytics.trackSubscriptionStarted('pro', '$4.99/week');
```

### Data Structure
Each event is stored with:
- `user_id` - Who performed the action
- `session_id` - Unique session identifier
- `event_name` - What happened
- `properties` - Additional data (JSON)
- `created_at` - When it happened

## Admin Dashboard Queries

### Onboarding Funnel
```sql
SELECT * FROM analytics_onboarding_funnel;
```
Shows how many users reach each onboarding step.

### Onboarding Completion Rate
```sql
SELECT * FROM analytics_onboarding_completion;
```
Shows percentage of users who complete onboarding.

### Drop-off Points
```sql
SELECT * FROM get_onboarding_dropoff();
```
Shows where users are dropping off during onboarding.

### Subscription Conversion
```sql
SELECT * FROM analytics_subscription_conversion;
```
Shows paywall → purchase conversion rate.

### Daily Active Users (Last 30 Days)
```sql
SELECT * FROM analytics_daily_active_users 
WHERE date >= CURRENT_DATE - 30
ORDER BY date DESC;
```

### 7-Day Retention
```sql
SELECT * FROM get_user_retention(7);
```

### Feature Usage (Last 7 Days)
```sql
SELECT * FROM analytics_feature_usage 
WHERE date >= CURRENT_DATE - 7
ORDER BY total_uses DESC;
```

## Admin Panel Integration

The desktop app will have an admin panel at `/admin` (accessible only to `edwardsjonny547@gmail.com`) that displays:

1. **Onboarding Funnel Visualization**
   - Bar chart showing users at each step
   - Drop-off percentages highlighted

2. **Key Metrics Cards**
   - DAU/WAU/MAU
   - Onboarding completion rate
   - Paywall conversion rate
   - Average session duration

3. **Retention Chart**
   - 7-day and 30-day retention curves
   - Cohort analysis

4. **Feature Usage Table**
   - Most/least used features
   - Usage trends over time

5. **Real-time Events Feed**
   - Live stream of recent events
   - Filterable by event type

## Privacy & Security

- **Row-level security**: Users can only see their own events
- **Admin access**: Only `edwardsjonny547@gmail.com` can view all events
- **No PII in properties**: Don't store sensitive data in event properties
- **GDPR compliant**: Users can request data deletion via Supabase

## Testing

To test analytics in development:

1. Sign in to the mobile app
2. Go through onboarding
3. Use various features
4. Check Supabase SQL Editor:
   ```sql
   SELECT * FROM analytics_recent_events LIMIT 20;
   ```

You should see events appearing in real-time!

## Troubleshooting

### Events not appearing?
1. Check console logs for `[Analytics]` messages
2. Verify user is signed in (events require `user_id`)
3. Check Supabase table permissions
4. Ensure SQL script was run successfully

### Permission errors?
1. Verify RLS policies are enabled
2. Check that authenticated users can INSERT
3. Confirm admin email matches in policy

### Slow queries?
1. Indexes are automatically created
2. For custom queries, add indexes as needed
3. Use views for common aggregations

## Next Steps

1. ✅ Run SQL script in Supabase
2. ✅ Analytics service is already integrated in mobile app
3. 🔄 Add tracking to remaining screens (in progress)
4. 🔄 Build admin dashboard on desktop app (next)
5. 📊 Set up monitoring and alerts

## Cost

**Free forever!** Supabase free tier includes:
- 500MB database
- 2GB file storage
- 50,000 monthly active users
- Unlimited API requests

Analytics events are small (~1KB each), so you can track millions of events within the free tier.
