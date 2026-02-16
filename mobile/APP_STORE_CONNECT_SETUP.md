# App Store Connect Setup Guide - Final Steps

## ✅ What's Already Fixed

### 1. iPad Login Bug - FIXED ✅
**File:** `mobile/navigation/AppNavigator.tsx`
- Added 5-second timeout to prevent hanging on profile check
- Multiple fallback checks for `HAS_COMPLETED_ONBOARDING` flag
- Comprehensive error handling to prevent login loops
- Committed and pushed to GitHub

### 2. Sign in with Apple Compliance - FIXED ✅
**File:** `mobile/contexts/AuthContext.tsx`
- Apple Sign-In ALWAYS skips onboarding (no name/email prompt)
- Uses Apple-provided name on first sign-in
- Generates username from email on repeat sign-in
- Same logic applied to Google Sign-In for consistency

### 3. Privacy Policy Content - VERIFIED ✅
Your privacy policy at `https://myinsightai.app/privacy` is accurate and comprehensive.

---

## 🎯 What You Need to Do in App Store Connect

### Step 1: Add Privacy Policy URL

**Location:** App Information page

1. Go to https://app.netlify.com/sites/YOUR_SITE/deploys
2. In the left sidebar, click **"App Information"** (under "General" section)
3. Scroll down to find **"Privacy Policy URL"** field
4. Enter: `https://myinsightai.app/privacy`
5. Click **Save** at the top right

---

### Step 2: Add Terms of Use to App Description

**Location:** Your app version (1.0) page

**Option A: Use Standard Apple EULA + Add Links in Description (RECOMMENDED)**

1. In left sidebar, click on **"1.0"** under "iOS App"
2. Scroll to **"Description"** field
3. At the **bottom** of your existing description, add these lines:

```
Terms of Service: https://myinsightai.app/terms
Privacy Policy: https://myinsightai.app/privacy
```

4. Click **Save**

**Option B: Upload Custom EULA (Alternative)**

1. In left sidebar, click **"App Information"**
2. Scroll to **"License Agreement"** section
3. Click **"Add Custom License Agreement"**
4. Copy/paste your Terms of Service content from `https://myinsightai.app/terms`
5. Click **Save**

---

### Step 3: Submit In-App Purchases for Review

**This is CRITICAL - Apple rejected because IAP products weren't submitted**

**Location:** In-App Purchases section

1. In left sidebar, click **"In-App Purchases"** (under "Monetization")
2. You should see 3 subscription products:
   - Weekly ($4.99/week)
   - Monthly ($17.99/month)
   - Yearly ($69.99/year)

**For EACH subscription:**

a. Click on the subscription
b. **Add a screenshot** (REQUIRED):
   - Take a screenshot of your PaywallScreen showing the subscription
   - Or use a screenshot from your app showing the pricing
   - Upload it in the "Review Information" section
c. Verify all metadata is filled:
   - Display Name ✅
   - Description ✅
   - Price ✅
   - Subscription Duration ✅
d. Click **"Submit for Review"** button at the top
e. Confirm submission

**Repeat for all 3 subscriptions!**

---

### Step 4: Add Subscription Links to Paywall (Already Done ✅)

Your `PaywallScreen.tsx` already has:
- Terms: `https://myinsightai.app/terms` (line 636)
- Privacy: `https://myinsightai.app/privacy` (line 640)

No action needed here!

---

## 🧪 Testing on iPad Simulator

**CRITICAL: Test the login fix before resubmitting**

### Test Procedure:

1. **Open iPad Simulator:**
   ```bash
   cd mobile
   npx expo start
   # Press 'i' to open iOS simulator
   # Select iPad Air 11-inch from simulator menu
   ```

2. **Test Apple Sign-In Flow:**
   - Tap "Sign in with Apple"
   - Complete Apple authentication
   - **VERIFY:** App goes directly to MainTabs (NOT back to login)
   - **VERIFY:** No name/email input screen appears

3. **Test Logout/Login:**
   - Go to Settings → Logout
   - Sign in with Apple again
   - **VERIFY:** Goes directly to MainTabs

4. **Test Fresh Install:**
   - Delete app from simulator
   - Reinstall and run
   - Sign in with Apple
   - **VERIFY:** Goes to MainTabs after authentication

### Expected Logs (Check Xcode Console):

```
[AUTH] ✅ Apple profile saved
[AUTH] ✅ Onboarding marked complete for Apple Sign-In (compliance)
[NAV] HAS_COMPLETED_ONBOARDING from storage: true
[NAV] ✅ Onboarding complete flag found - going to MainTabs
```

### If Login Loop Still Occurs:

Check logs for:
- `[NAV] Profile check timed out` - Network issue
- `[NAV] ⚠️ Profile check failed` - Database issue
- Look for any errors in the console

---

## 📱 Resubmission Checklist

Before resubmitting to App Store:

- [ ] Privacy Policy URL added to App Information
- [ ] Terms of Service link added to App Description
- [ ] All 3 IAP products submitted for review with screenshots
- [ ] iPad login tested and working (no loop)
- [ ] Apple Sign-In tested (no name/email prompt)
- [ ] Build number incremented (if required)
- [ ] New build uploaded to App Store Connect (if code changed)

---

## 🚀 How to Resubmit

### If You Made Code Changes (iPad fix):

1. **Increment Build Number:**
   - Open `mobile/app.json`
   - Change `"buildNumber": "X"` to next number
   - Or change `"version": "1.0"` to `"1.0.1"`

2. **Build New Version:**
   ```bash
   cd mobile
   eas build --platform ios --profile production
   ```

3. **Upload to App Store Connect:**
   - Wait for build to complete (~15-20 minutes)
   - Go to App Store Connect → Your App → TestFlight
   - New build will appear automatically
   - Select it for your App Store submission

4. **Submit for Review:**
   - Go to "App Store" tab
   - Click "Submit for Review"
   - Answer questions
   - Submit

### If No Code Changes Needed:

1. Just update the metadata (Privacy URL, Terms, IAP)
2. Click "Submit for Review" with existing build

---

## 📋 Response to Apple Template

When resubmitting, you can reply to Apple's message:

```
Hello Apple Review Team,

Thank you for the detailed feedback. We have addressed all the issues:

1. **Sign in with Apple Compliance:**
   - Fixed: App no longer asks for name/email after Apple authentication
   - Apple-provided information is used directly
   - No redundant data collection

2. **In-App Purchase Products:**
   - All 3 subscription products (Weekly, Monthly, Yearly) have been submitted for review
   - Screenshots and metadata included

3. **Subscription Links:**
   - Privacy Policy: https://myinsightai.app/privacy (added to App Information)
   - Terms of Service: https://myinsightai.app/terms (added to App Description)
   - Both links are functional and accessible in the app

4. **iPad Login Bug:**
   - Fixed: Improved authentication flow to prevent login loops
   - Added timeout and fallback logic for profile checks
   - Tested on iPad Air 11-inch simulator

All issues have been resolved. Thank you for your patience.

Best regards,
InsightAI Team
```

---

## 🔍 Common Issues & Solutions

### Issue: Can't find "App Information" page
**Solution:** It's in the left sidebar under "General" section, NOT under your version number.

### Issue: Can't find where to add App Description
**Solution:** Click on your version number (1.0) in left sidebar, then scroll to "Description" field.

### Issue: IAP products don't have "Submit for Review" button
**Solution:** Make sure you've added a screenshot first. Apple requires screenshots for IAP review.

### Issue: Build number error when uploading
**Solution:** Increment the build number in `app.json` before building.

---

## ✅ Success Indicators

You'll know everything is correct when:

1. Privacy Policy URL shows in App Information page
2. Terms link appears at bottom of App Description
3. All 3 IAP products show "Waiting for Review" status
4. iPad simulator login works without looping
5. Apple Sign-In doesn't ask for name/email

---

## 📞 Need Help?

If you encounter issues:
1. Check the console logs in Xcode
2. Verify all URLs are accessible: `https://myinsightai.app/privacy` and `https://myinsightai.app/terms`
3. Make sure you're testing on iPad Air 11-inch (same as Apple's review device)
4. Double-check all 3 IAP products are submitted (not just created)

Good luck with the resubmission! 🚀
