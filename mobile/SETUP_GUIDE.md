# Setup Guide for Build 40+

## Issue 1: RevenueCat Subscriptions "Coming Soon"

### Problem
The app shows "Subscriptions Coming Soon" because the RevenueCat API key is missing from `.env`.

### Solution
1. Go to RevenueCat Dashboard: https://app.revenuecat.com/
2. Navigate to your project settings
3. Copy your **Public SDK Key** (iOS)
4. Add to `/Users/lucas/Desktop/InsightAI/mobile/.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_API_KEY=your_ios_public_sdk_key_here
   ```
5. Update `App.tsx` or `AuthContext.tsx` to initialize RevenueCat with this key

### Testing in TestFlight Sandbox
- RevenueCat works in TestFlight with sandbox purchases
- Make sure you're logged into a sandbox tester account in Settings > App Store
- Create sandbox testers in App Store Connect > Users and Access > Sandbox Testers

---

## Issue 2: Re-enable Apple & Google Authentication

### Current Status
- ✅ Removed from `app.json` plugins
- ✅ Removed from `package.json` dependencies  
- ✅ Code commented out in `LoginScreen.tsx`
- ✅ Fresh provisioning profile (P5G58XGJZ2) without Apple Sign-In capability

### Steps to Re-enable

#### Option A: Using Terminal (Recommended)
```bash
cd /Users/lucas/Desktop/InsightAI/mobile

# 1. Re-add packages
npm install @react-native-google-signin/google-signin@^16.1.1 expo-apple-authentication@~8.0.8

# 2. Re-add plugins to app.json (I'll do this for you)

# 3. Delete old provisioning profile and regenerate with Apple Sign-In capability
eas credentials
# Select: iOS > production > Provisioning Profile > Remove Provisioning Profile

# 4. Rebuild with Apple account login to generate new profile
EXPO_APPLE_ID=lucashooper100@outlook.com eas build --platform ios --profile production
# When prompted, say YES to log in with Apple account
# EAS will automatically create a new provisioning profile with Apple Sign-In capability

# 5. Uncomment social auth code in LoginScreen.tsx (I'll do this for you)
```

#### Option B: Using Apple Developer Portal
1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Find profile for `com.crupid.mobile`
3. Click "Edit"
4. Enable "Sign in with Apple" capability
5. Save and download
6. Upload to EAS using `eas credentials`

**Recommendation:** Use Option A (terminal) - it's simpler and EAS handles everything automatically.

---

## Issue 3: Login Flow Fixed ✅

### What Was Wrong
Existing users logging in were sent to onboarding because the app only checked AsyncStorage for `HAS_COMPLETED_ONBOARDING`. On a new device or after reinstall, this flag wouldn't exist.

### What I Fixed
Updated `AppNavigator.tsx` to:
1. Check AsyncStorage first
2. If no flag but user is logged in, query Supabase `profiles` table
3. If profile exists with a name → mark as existing user, skip onboarding
4. Set the AsyncStorage flag for future app launches

This fix is already included in the code and will be in Build 40.

---

## Next Steps

1. **Add RevenueCat API Key** to `.env`
2. **Re-enable Apple/Google Auth** using Option A above
3. **Build and Test** Build 40 in TestFlight

Let me know when you're ready to proceed with re-enabling authentication!
