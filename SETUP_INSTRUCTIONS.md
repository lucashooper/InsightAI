# InsightAI - Setup Instructions

## 🚀 Database Migration Required

You need to run the SQL migration to enable usage tracking and subscription tiers.

### Steps to Run Migration:

1. **Go to Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to the SQL Editor

2. **Run the Migration**
   - Open the file: `database/migrations/add_usage_tracking.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify**
   - Check that the `usage_tracking` table was created
   - Verify that your account (edwardsjonny547@gmail.com) has `subscription_tier = 'unlimited'`

### What the Migration Does:

✅ Adds `subscription_tier` column to `user_profiles` table
✅ Creates `usage_tracking` table for tracking AI usage
✅ Sets your account to "unlimited" tier automatically
✅ Creates helper functions for checking daily limits

## 📊 New Features Implemented

### 1. Inline Probe Deeper (Mindsera-Style) ✨
- AI response now appears **directly below your text** in the editor
- No more separate chat overlay
- Clean, integrated experience
- Automatically resets when switching notes (bug fixed!)

### 2. Usage Limits 🎯
- **Free Plan**: 2 AI analyses per day
- **Pro Plan**: Unlimited (999,999 per day)
- **Unlimited Plan**: Truly unlimited (your account!)

### 3. Settings Page Updated 💎
- Shows current subscription tier
- Displays daily usage progress bar (for free users)
- Lists plan benefits
- Your account shows "✨ Unlimited" badge

## 🔧 Technical Changes

### Files Modified:
1. `src/components/diary/DiaryEditor.tsx` - Inline AI response
2. `src/components/ai/AIAnalysis.tsx` - Usage tracking for analyses
3. `src/components/settings/SettingsView.tsx` - Subscription display
4. `src/services/usageTrackingService.ts` - NEW service for tracking
5. `database/migrations/add_usage_tracking.sql` - NEW migration

### How It Works:
- Before each AI call, we check `usageTrackingService.checkDailyLimit()`
- If under limit, proceed and track with `usageTrackingService.trackAction()`
- If over limit, show friendly message: "You've reached your daily limit of 2 AI insights. Upgrade to Pro for unlimited access!"

## 🎉 Ready to Test!

After running the migration:
1. Test the inline Probe Deeper feature
2. Try switching between notes (should work smoothly now)
3. Check Settings page to see your "Unlimited" tier
4. Test with a different account to see the free tier limits

## 💡 Next Steps (Optional)

If you want to monetize:
1. Integrate Stripe for payments
2. Add upgrade button in Settings
3. Create checkout flow for Pro tier ($9.99/month suggested)
4. Update subscription_tier when payment succeeds

---

**Note**: The lint warnings about unused variables (`isSaving`, `lastSaved`, etc.) are pre-existing and not related to these changes. They can be cleaned up later if needed.
