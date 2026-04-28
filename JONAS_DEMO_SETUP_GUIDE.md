# Jonas Demo Account - Complete Setup Guide

## ✅ NO APP STORE DEPLOYMENT NEEDED!

Your existing app already checks `user_profiles.subscription_tier` from Supabase. By setting a user to `'pro'` tier in the database, they get unlimited AI scans **immediately** - no app update required!

---

## 📋 Step-by-Step Setup (5 minutes)

### Step 1: Create User in Supabase Dashboard

1. Open Supabase Dashboard
2. Go to **Authentication → Users → Add user manually**
3. Fill in:
   - **Email:** `demo.insight@gmail.com` (or any email you prefer)
   - **Password:** `InsightDemo2026!` (or your choice)
   - **Auto Confirm User:** ✅ YES (important!)
4. Click "Create user"
5. **Copy the user_id (UUID)** that appears - you'll need this for the next step

### Step 2: Run SQL Script

1. Go to **SQL Editor** in Supabase
2. Open the file `JONAS_COMPLETE_DEMO_SETUP.sql`
3. Find line 22: `v_user_id UUID := 'USER_ID_HERE';`
4. Replace `'USER_ID_HERE'` with the actual user_id from Step 1
5. Click **Run** to execute the script

### Step 3: Verify Setup

Run these queries in SQL Editor to confirm:

```sql
-- Check user has Pro tier
SELECT username, subscription_tier 
FROM user_profiles 
WHERE user_id = 'YOUR_USER_ID';

-- Check entries were created (should see 4)
SELECT count(*) FROM notes WHERE user_id = 'YOUR_USER_ID';

-- Check AI analysis exists (should see 1)
SELECT count(*) FROM ai_responses WHERE user_id = 'YOUR_USER_ID';
```

### Step 4: Send Credentials to Jonas

Email him:
```
Email: demo.insight@gmail.com
Password: InsightDemo2026!
```

---

## 🎯 What Jonas Will See Immediately

When Jonas logs in with the demo account, he'll see:

### 1. **Dashboard with 4 Pre-populated Entries**
- ✅ Recent anxious entry (2 hours ago) - **with AI analysis ready**
- ✅ Grateful entry (1 day ago)
- ✅ Stressed entry (3 days ago)  
- ✅ Hopeful entry (5 days ago)

### 2. **Full Premium Features Unlocked**
- ✅ Unlimited AI scans
- ✅ Mind bubbles visualization
- ✅ Pattern recognition
- ✅ All analytics
- ✅ No paywall prompts

### 3. **Ready-to-Experience Features**
- He can tap the recent entry and see the AI analysis immediately
- He can scan the other entries to see more AI insights
- He can view patterns across the 4 entries
- He can create new entries
- He can delete the test entries if he wants

---

## 💡 Why This Approach is Perfect

### Pros:
✅ **No waiting** - Works immediately, no App Store approval
✅ **Shows value instantly** - He doesn't start with a blank slate
✅ **Demonstrates features** - AI analysis, mood tracking, patterns all visible
✅ **Professional** - Feels like a curated demo experience
✅ **Flexible** - He can delete test entries and use his own
✅ **No code changes** - Uses existing app subscription logic

### The Test Entries Show:
1. **Variety of emotions** - anxious, grateful, stressed, hopeful
2. **AI analysis capability** - One entry already analyzed with deep insights
3. **Pattern tracking** - Multiple entries over time show trends
4. **Real-world content** - Authentic journaling, not lorem ipsum
5. **Natural usage** - Entries spread across different days

---

## 🔒 Security Notes

- The demo account is isolated (can only see their own data)
- Pro tier only affects feature access, not data access
- You can delete/disable the account anytime
- No special admin privileges, just premium features

---

## 📧 Suggested Message to Jonas

```
Hey Jonas,

I've set up a demo account so you can experience the app without any friction:

📧 Email: demo.insight@gmail.com
🔑 Password: InsightDemo2026!

When you log in, you'll see 4 pre-populated journal entries that demonstrate different features:
- AI analysis of your thoughts and patterns
- Mood tracking over time
- Cognitive distortion detection
- Personalized coping suggestions

Everything is unlocked (no paywall), and you can:
✅ Try the AI analysis on the existing entries
✅ Create your own entries
✅ Delete the test entries if you prefer to start fresh
✅ Explore all premium features

I pre-populated it with sample entries so you can immediately see how the AI works, but feel free to use it however you want.

Would love to hear your honest thoughts after you've had a chance to explore. No pressure on the partnership — genuinely just interested in your feedback as someone in this space.

Let me know if you have any issues logging in!

Best,
Lucas
```

---

## 🎬 Alternative: Generic Welcome Text

If you want to explain the test entries when he logs in, you could consider adding a welcome note/modal in the app, but honestly the current approach is clean - he'll figure it out immediately.

---

## 🔄 If You Want to Reset the Demo Account

```sql
-- Delete all entries and AI responses
DELETE FROM ai_responses WHERE user_id = 'USER_ID_HERE';
DELETE FROM notes WHERE user_id = 'USER_ID_HERE';
DELETE FROM analytics_events WHERE user_id = 'USER_ID_HERE';

-- Then re-run the setup script
```

---

## 📊 Tracking Jonas's Usage (Optional)

After he's had a few days, you can check his usage:

```sql
-- See what he's created
SELECT created_at, mood, entry_type, LEFT(content, 100) as preview
FROM notes 
WHERE user_id = 'USER_ID_HERE'
AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- See how many times he's used AI analysis
SELECT COUNT(*) as ai_scans
FROM ai_responses 
WHERE user_id = 'USER_ID_HERE'
AND created_at > NOW() - INTERVAL '7 days';

-- See his app opens
SELECT DATE(created_at) as date, COUNT(*) as opens
FROM analytics_events
WHERE user_id = 'USER_ID_HERE'
AND event_name = 'app_opened'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

This helps you understand if he's actually using it (good signal for potential partnership).

---

## ⚡ Pro Tip

When you follow up with Jonas in 3-4 days, you can casually mention: "I saw you logged in a few times - curious what you thought about [specific feature]?" This shows you're paying attention without being creepy.

Good luck! 🚀
