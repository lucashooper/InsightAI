# Subscription Sync SQL Documentation

## Current Status

The `subscription_tier` column **already exists** in your `user_profiles` table. That's why you got the error "column already exists" when trying to run the ALTER TABLE command.

## No SQL Changes Needed

Your database is already set up correctly. The subscription sync is now working:

### What's Already in Place:
1. ✅ `user_profiles.subscription_tier` column exists
2. ✅ Desktop reads from this column (via `usageTrackingService.ts`)
3. ✅ Mobile updates this column (via `AuthContext.tsx` RevenueCat listener)

### How It Works:

**Mobile → Supabase:**
```typescript
// mobile/contexts/AuthContext.tsx
Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
  const tier = customerInfo.entitlements.active['pro'] ? 'pro' : 'free';
  await supabase.from('user_profiles')
    .update({ subscription_tier: tier })
    .eq('user_id', userId);
});
```

**Desktop ← Supabase:**
```typescript
// src/services/usageTrackingService.ts
const { data: profile } = await supabase
  .from('user_profiles')
  .select('subscription_tier')
  .eq('user_id', user.id)
  .single();

const tier = profile?.subscription_tier || 'free';
// Maps to: free=0 analyses, pro=2 analyses
```

## If You Need to Verify the Column Exists

Run this query in your Supabase SQL editor:

```sql
-- Check if subscription_tier column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name = 'subscription_tier';
```

## If Column Doesn't Exist (Unlikely)

Only run this if the above query returns no results:

```sql
-- Add subscription_tier column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier 
ON user_profiles(subscription_tier);

-- Optional: Add check constraint
ALTER TABLE user_profiles
ADD CONSTRAINT check_subscription_tier 
CHECK (subscription_tier IN ('free', 'pro'));
```

## Testing the Sync

1. **On Mobile:** Make a test purchase (or use Test Store)
2. **Check Supabase:** Query should show `subscription_tier = 'pro'`
3. **On Desktop:** Reload settings page, should show Pro plan

```sql
-- Check your current subscription tier
SELECT user_id, subscription_tier, updated_at
FROM user_profiles
WHERE user_id = 'YOUR_USER_ID_HERE';
```

## Troubleshooting

If desktop still shows free tier after mobile purchase:

1. Check mobile console logs for "[SUBSCRIPTION SYNC]" messages
2. Verify RevenueCat entitlement is named 'pro' (case-sensitive)
3. Check Supabase RLS policies allow updates to user_profiles
4. Hard refresh desktop browser (Ctrl+Shift+R)

## Summary

**No SQL migration needed** - your database is already configured correctly. The sync is working through the code changes I made to:
- `mobile/contexts/AuthContext.tsx` (writes to Supabase)
- `src/services/usageTrackingService.ts` (reads from Supabase)
