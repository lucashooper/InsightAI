# Social Authentication Setup Guide

## Overview

Google and Apple Sign-In have been implemented in the app. You now need to configure Supabase to enable these authentication providers.

---

## 1. Configure Google OAuth in Supabase

### Step 1: Go to Supabase Authentication Settings

1. Open https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk
2. Go to **Authentication** → **Providers**
3. Find **Google** in the list

### Step 2: Enable Google Provider

1. Toggle **Enable Sign in with Google** to ON
2. Enter the following credentials:

**Client ID (for Web):**
```
878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com
```

**Client Secret:**
```
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
```

3. **Authorized redirect URLs** should already be set to:
```
https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback
```

4. Click **Save**

### Step 3: Verify Google Cloud Console Settings

Your Google OAuth is already configured with:
- iOS Client ID: `878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef.apps.googleusercontent.com`
- Web Client ID: `878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com`
- iOS URL Scheme: `com.googleusercontent.apps.878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef`

Make sure in Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Verify the **Authorized redirect URIs** include:
   - `https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback`

---

## 2. Configure Apple Sign-In in Supabase

### Step 1: Go to Supabase Authentication Settings

1. In Supabase dashboard: **Authentication** → **Providers**
2. Find **Apple** in the list

### Step 2: Enable Apple Provider

1. Toggle **Enable Sign in with Apple** to ON
2. You'll need to create a **Services ID** in Apple Developer Portal

### Step 3: Create Apple Services ID

1. Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Click **"+"** to create a new Services ID
3. Fill in:
   - **Description:** Insight Sign In
   - **Identifier:** `com.crupid.mobile.signin` (or similar)
4. Check **"Sign In with Apple"**
5. Click **Configure** next to Sign In with Apple
6. Set:
   - **Primary App ID:** `com.crupid.mobile`
   - **Domains and Subdomains:** `ptpqvghlaesyrzlljzkk.supabase.co`
   - **Return URLs:** `https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback`
7. Click **Save** and **Continue**
8. Click **Register**

### Step 4: Create Apple Sign-In Key

1. Go to https://developer.apple.com/account/resources/authkeys/list
2. Click **"+"** to create a new key
3. Fill in:
   - **Key Name:** Insight Apple Sign In
   - Check **Sign In with Apple**
4. Click **Configure** next to Sign In with Apple
5. Select your Primary App ID: `com.crupid.mobile`
6. Click **Save**
7. Click **Continue** and then **Register**
8. **Download the .p8 key file** (you can only download it once!)
9. Note the **Key ID** (10 characters)

### Step 5: Configure in Supabase

Back in Supabase → Authentication → Providers → Apple:

1. **Services ID:** Enter the Services ID you created (e.g., `com.crupid.mobile.signin`)
2. **Authorized Client IDs:** Enter your bundle ID: `com.crupid.mobile`
3. **Key ID:** Enter the 10-character Key ID from Step 4
4. **Team ID:** Enter your Apple Team ID: `HMLV274G9F`
5. **Private Key:** Paste the contents of the .p8 file you downloaded
6. Click **Save**

---

## 3. Test the Implementation

### In TestFlight (Build 20+):

1. **Test Google Sign-In:**
   - Open the app
   - Go to Login screen
   - Tap "Continue with Google"
   - Select your Google account
   - Should redirect back to app and log you in

2. **Test Apple Sign-In:**
   - Open the app
   - Go to Login screen
   - Tap the Apple Sign In button
   - Use Face ID/Touch ID to authenticate
   - Should redirect back to app and log you in

### Expected Behavior:

- ✅ User signs in with Google/Apple
- ✅ Account is created in Supabase (check Authentication → Users)
- ✅ User is redirected to the main app
- ✅ User stays logged in on app restart

---

## 4. Troubleshooting

### Google Sign-In Issues:

**Error: "No ID token received"**
- Check that Web Client ID is configured in `.env`
- Verify Google Cloud Console has correct redirect URIs
- Make sure Supabase Google provider is enabled

**Error: "Invalid client"**
- Verify Client ID and Secret in Supabase match Google Cloud Console
- Check that the OAuth consent screen is published

### Apple Sign-In Issues:

**Error: "Invalid client"**
- Verify Services ID in Supabase matches Apple Developer Portal
- Check that Team ID is correct: `HMLV274G9F`
- Ensure the .p8 private key is pasted correctly (including BEGIN/END lines)

**Error: "Redirect URI mismatch"**
- Verify Return URL in Apple Services ID config: `https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback`
- Check domain is set to: `ptpqvghlaesyrzlljzkk.supabase.co`

---

## 5. What's Implemented

### Code Changes:

1. **Dependencies installed:**
   - `expo-auth-session`
   - `expo-crypto`
   - `expo-apple-authentication`
   - `@react-native-google-signin/google-signin`

2. **AuthContext updated:**
   - `signInWithGoogle()` method added
   - `signInWithApple()` method added
   - Google Sign-In configured with iOS and Web client IDs
   - Proper error handling and logging

3. **LoginScreen updated:**
   - Apple Sign-In button (native Apple button)
   - Google Sign-In button (custom styled)
   - Divider with "or" text
   - Loading states for social auth

4. **app.json configured:**
   - Google Sign-In plugin with iOS URL scheme
   - Apple Authentication plugin

5. **Environment variables:**
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## 6. Next Steps

1. ✅ Configure Google provider in Supabase (use credentials above)
2. ✅ Create Apple Services ID and Key
3. ✅ Configure Apple provider in Supabase
4. ✅ Wait for Build 20 to complete
5. ✅ Submit Build 20 to TestFlight
6. ✅ Test Google and Apple Sign-In in TestFlight
7. ✅ Verify users are created in Supabase
8. ✅ Submit to App Store

---

## Summary

Social authentication is now fully implemented in the app code. You just need to:

1. **Enable Google provider in Supabase** (2 minutes)
2. **Create Apple Services ID and Key** (5 minutes)
3. **Enable Apple provider in Supabase** (2 minutes)

Then test in TestFlight once Build 20 is ready!
