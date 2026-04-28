# Jonas Demo Account - Issues & Solutions

## 🔍 Root Cause Analysis

### Why "Free" Plan is Showing & Paywall Appeared

**The Problem:**
- Your app uses **RevenueCat** to check subscriptions, NOT the database `subscription_tier` field
- The app calls `Purchases.getCustomerInfo()` and checks `entitlements.active`
- Setting `subscription_tier = 'pro'` in Supabase does nothing - the app never reads that field

**Where the Check Happens:**
```typescript
const customerInfo = await Purchases.getCustomerInfo();
const isProActive = !!customerInfo.entitlements.active['Insight Pro'];
```

This queries RevenueCat's API, not your database.

---

## ✅ Solutions (Choose Based on Timeline)

### **Option 1: Immediate Fix (For Testing NOW)**

**Just manually analyze the entries in the app:**

1. Log in as `insight@gmail.com` / `InsightDemo`
2. Tap each entry
3. Tap "Re-analyze" button
4. The AI will analyze it and populate:
   - ✅ Insights section
   - ✅ Emotional landscape
   - ✅ Mind bubbles
   - ✅ Patterns

**Why this works:**
- The entries exist with real content
- They just haven't been analyzed yet
- The paywall will show, but you can close it and analyze anyway (it's a soft gate)
- This lets you test the full flow

**Pros:**
- ✅ Works immediately
- ✅ No code changes needed
- ✅ You can test right now

**Cons:**
- ❌ Manual work per entry
- ❌ Paywall will still appear (annoying but closeable)

---

### **Option 2: Proper Fix (For Jonas & Future Demos)**

**Add the email to `DEMO_EMAILS` array:**

I've already updated `EntryDetailScreen.tsx` to include:
```typescript
const DEMO_EMAILS: string[] = ['insight@gmail.com'];
```

**To Apply:**
1. Rebuild the app
2. Submit to App Store (or test in dev build)
3. Once approved, Jonas gets:
   - ✅ 3 AI scans per day
   - ✅ No paywall prompts
   - ✅ Full demo experience

**Timeline:** 1-3 days for App Store review

---

## 📝 Fix "Untitled Entry" Issue

**Problem:** Entries don't have titles, showing as "Untitled Entry"

**Solution:** Run `FIX_JONAS_TITLES.sql` in Supabase:
- Adds proper titles like "Tough feedback at work", "Morning coffee reflection", etc.
- Takes 10 seconds

---

## 🎨 Fix Truncated Mood Display (Image 1)

**Problem:** Moods showing as "anxio", "grate", "stres" instead of full words

**Cause:** The UI component truncates mood text when it's too long for the container

**Solution:** This is a UI styling issue. The moods ARE correct in the database ("anxious", "grateful", "stressed"), the display is just cut off.

**Quick Fix Options:**
1. **Ignore it** - It's cosmetic and doesn't affect functionality
2. **Fix CSS** - Adjust the mood label container width/font size (requires app update)
3. **Use emojis** - Change moods to emoji-only display instead of text (requires app update)

**For Jonas demo:** This is acceptable as-is since the full mood shows when you open the entry.

---

## 🤔 Why Insights & Emotional Landscape Are Empty

**Problem:** The AI analysis we inserted into the database doesn't match the format the app expects.

**Why this happened:**
- We added `ai_response_text`, `ai_insights`, and `ai_structured_insights` to the notes
- But the app might be looking for different field names or data structures
- OR the app only reads AI data after running its own analysis API call

**Solution:** Just analyze the entries manually in the app. The AI will then store data in the EXACT format the app expects.

---

## 📧 For Jonas Specifically

### Immediate Actions (Before Sending Credentials):

1. **Run** `FIX_JONAS_TITLES.sql` to fix untitled entries
2. **Option A (Quick):** Send him credentials and let him analyze entries manually
3. **Option B (Clean):** 
   - Manually analyze all 4 entries yourself on the demo account
   - Then send him credentials with everything pre-populated

### Long-Term (For Clean Demo):

1. Deploy app update with `insight@gmail.com` in `DEMO_EMAILS`
2. This gives 3 scans/day without paywall
3. Future influencers can be added the same way

---

## 🎯 Recommended Approach

### For Testing Now:
1. ✅ Run `FIX_JONAS_TITLES.sql` 
2. ✅ Log in and manually analyze 1-2 entries to verify everything works
3. ✅ Accept that paywall will show but can be closed

### For Jonas:
1. ✅ Wait for app update with `DEMO_EMAILS` fix
2. ✅ Then send him clean credentials
3. ✅ Or send now and explain "tap Re-analyze on each entry"

---

## 📱 What Jonas Will See After Manual Analysis

Once you (or he) taps "Re-analyze" on each entry:

✅ **Insights section** - Populated with:
- Cognitive distortions detected
- Emotional triggers
- Coping suggestions
- Conversational AI response

✅ **Emotional landscape** - Shows:
- Mood distribution chart
- Emotional patterns
- Trends over time

✅ **Mind bubbles** - Displays:
- Key themes and patterns
- Recurring thoughts
- Emotional connections

---

## 🔑 Key Takeaway

**The database `subscription_tier` field is NOT used by the app.**

Your app exclusively uses **RevenueCat** for subscription checks. To bypass this:
- Add emails to `DEMO_EMAILS`, `ADMIN_EMAILS`, or `UNLIMITED_EMAILS` arrays in code
- Requires app deployment
- OR manually test with paywall (closeable)

For immediate testing: Just analyze entries manually. For Jonas: Deploy code fix first.
