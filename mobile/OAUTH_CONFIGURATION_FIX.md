# OAuth Configuration Fixes Required

This document outlines the configuration issues preventing Apple Sign-In and Google Sign-In from working in your TestFlight build.

---

## 🍎 **Apple Sign-In Issue**

### **Error**
```
Apple Sign-In Failed
Unacceptable audience in id_token: [com.crupid.mobile]
```

### **Root Cause**
Your Supabase project's Apple Sign-In configuration doesn't recognize `com.crupid.mobile` as a valid bundle ID.

### **Fix Required in Supabase Dashboard**

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your InsightAI project

2. **Open Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **Providers**
   - Find **Apple** provider

3. **Update Apple Configuration**
   - **Bundle ID**: Add or update to `com.crupid.mobile`
   - **Services ID**: Should match your Apple Developer Console configuration
   - **Key ID**: Your Apple Sign-In key ID from Apple Developer Console
   - **Team ID**: Your Apple Developer Team ID
   - **Private Key**: Your Apple Sign-In private key (.p8 file)

4. **Verify in Apple Developer Console**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Find your App ID: `com.crupid.mobile`
   - Ensure **Sign In with Apple** capability is enabled
   - Configure Services ID to match Supabase settings

### **Expected Behavior After Fix**
- Apple Sign-In will successfully authenticate
- User will be created in Supabase with Apple ID
- App will navigate to onboarding flow

---

## 🔵 **Google Sign-In Issue**

### **Error**
```
Google Sign-In Failed
No ID token present
```

### **Root Cause**
The Google Sign-In SDK is not returning an `idToken` in the response. This typically happens when:
1. OAuth client is not configured correctly in Google Cloud Console
2. Wrong client IDs are being used
3. Missing required scopes

### **Fix Required in Google Cloud Console**

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com
   - Select your project

2. **Check OAuth 2.0 Client IDs**
   - Go to **APIs & Services** → **Credentials**
   - Find your iOS OAuth client ID
   - Verify it matches: `878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef.apps.googleusercontent.com`

3. **Verify iOS Client Configuration**
   - **Application type**: iOS
   - **Bundle ID**: `com.crupid.mobile`
   - **App Store ID**: Your app's App Store ID (if published)

4. **Check Web Client Configuration**
   - You also need a **Web application** OAuth client
   - This is used for server-side token validation
   - Verify it matches: `878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com`

5. **Update Supabase Google Provider**
   - Go to Supabase Dashboard → Authentication → Providers → Google
   - **Client ID**: Use the **Web** client ID (not iOS)
   - **Client Secret**: From the Web OAuth client

### **Important Notes**
- Google Sign-In requires BOTH iOS and Web OAuth clients
- The iOS client is used by the app to authenticate
- The Web client is used by Supabase to validate tokens
- Make sure both are enabled and properly configured

### **Expected Behavior After Fix**
- Google Sign-In will return an `idToken`
- Token will be validated by Supabase
- User will be created/signed in
- App will navigate to onboarding flow

---

## 📧 **Email Verification Issue - FIXED**

### **What Was Wrong**
After entering the OTP code, the app would redirect to the first onboarding page instead of showing "Email Confirmed" and continuing to the name input screen.

### **Root Cause**
Race condition: The `EmailVerifiedScreen` was checking if the user was authenticated before the auth state had updated after OTP verification.

### **Fix Applied**
- Added `useEffect` to wait for auth state to update
- Show loading spinner while waiting for authentication
- Only show "Continue" button once user is confirmed authenticated
- Added 2-second timeout fallback if auth state doesn't update

### **Expected Behavior Now**
1. User enters OTP code
2. Code is verified with Supabase
3. EmailVerifiedScreen shows loading spinner
4. Once auth state updates, shows "Email Confirmed!" with Continue button
5. Clicking Continue navigates to OnboardingQuestion screen

---

## 💳 **Subscription Verification Issue - FIXED**

### **What Was Wrong**
After successful purchase, the app showed "Subscription not active" error, even though the purchase succeeded.

### **Root Cause**
We were invalidating the RevenueCat cache on PaywallScreen load, which cleared the fresh purchase data before we could verify it.

### **Fix Applied**
- Removed cache invalidation from PaywallScreen
- Cache is only invalidated on:
  1. App startup (App.tsx)
  2. User sign out (AuthContext.tsx)
  3. Manual debug reset (Settings)
- This preserves purchase data for immediate verification

### **Expected Behavior Now**
1. User completes purchase
2. RevenueCat processes transaction
3. `handleCustomerInfo` receives fresh customer data
4. Subscription is verified as active
5. User is navigated to MainTabs

---

## 🧪 **Testing Checklist**

### **After Fixing OAuth Configuration:**

- [ ] Test Apple Sign-In in TestFlight
  - Should authenticate successfully
  - Should create user in Supabase
  - Should navigate to onboarding

- [ ] Test Google Sign-In in TestFlight
  - Should authenticate successfully
  - Should create user in Supabase
  - Should navigate to onboarding

- [ ] Test Email Verification
  - Enter email and receive OTP
  - Enter OTP code
  - Should show "Email Confirmed!" screen
  - Should navigate to name input screen

- [ ] Test Subscription Flow
  - Complete purchase
  - Should show "Purchase successful"
  - Should verify subscription as active
  - Should navigate to MainTabs

---

## 📝 **Configuration Summary**

### **Current App Configuration**
- **Bundle ID**: `com.crupid.mobile`
- **iOS Client ID**: `878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef.apps.googleusercontent.com`
- **Web Client ID**: `878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com`
- **URL Scheme**: `com.googleusercontent.apps.878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef`

### **What Needs to Match**
1. **Supabase Apple Provider** → Bundle ID: `com.crupid.mobile`
2. **Supabase Google Provider** → Client ID: Web client (not iOS)
3. **Google Cloud Console** → iOS client with Bundle ID: `com.crupid.mobile`
4. **Apple Developer Console** → App ID with Sign In with Apple enabled

---

## 🚨 **Critical Notes**

1. **OAuth changes require app rebuild**: After changing OAuth configuration in cloud consoles, you may need to rebuild and resubmit to TestFlight.

2. **Test in TestFlight, not Expo Go**: OAuth providers don't work properly in Expo Go due to URL scheme limitations.

3. **Subscription testing**: Use sandbox accounts from App Store Connect for testing purchases.

4. **Cache invalidation**: The app now intelligently manages RevenueCat cache to prevent false "not active" errors while still validating against the current Apple ID.

---

## 📞 **Support**

If issues persist after configuration:
1. Check Supabase logs for authentication errors
2. Check Google Cloud Console logs for OAuth errors
3. Verify all credentials match between platforms
4. Ensure TestFlight build is using latest configuration
