# 🔐 Google OAuth Setup Guide

This guide shows you how to add Google Sign-In to InsightAI.

## 📋 Prerequisites

- Google account
- Access to Google Cloud Console
- Supabase project (already configured)

---

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install @supabase/auth-helpers-react
```

Supabase already has built-in Google OAuth support, so we don't need external libraries!

---

### 2. Configure Google Cloud Console

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com/)

2. **Create/Select Project:**
   - Create a new project or select existing
   - Name it "InsightAI" or similar

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: InsightAI
     - User support email: your email
     - Developer contact: your email
   - Application type: **Web application**
   - Name: InsightAI Web Client

5. **Add Authorized Redirect URIs:**

   Add these EXACT URLs to Google Cloud Console:

   ```
   Development:
   http://localhost:5173
   
   Supabase (CRITICAL - This is the one that matters!):
   https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback
   
   Production (when deployed):
   https://yourdomain.com
   ```

   **⚠️ IMPORTANT:** The Supabase callback URL is what Google redirects to, NOT your localhost URL!

6. **Copy Credentials:**
   - Copy your **Client ID**
   - Copy your **Client Secret**

---

### 3. Configure Supabase

1. **Go to Supabase Dashboard:**
   - Open your project
   - Go to **Authentication** → **Providers**

2. **Enable Google Provider:**
   - Find "Google" in the list
   - Toggle it **ON**
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click **Save**

3. **Get Redirect URL:**
   - Copy the "Callback URL (for OAuth)" shown in Supabase
   - It should look like: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Make sure this is added to Google Cloud Console (step 2.5)

---

### 4. Update Your Code

The Google OAuth button is already added to the `Login.tsx` component!

Replace the placeholder click handler with this:

```typescript
import { supabase } from '../../services/supabaseClient';

// In Login component
const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    setError(error.message);
  }
};

// Update button onClick
<button 
  type="button" 
  className="oauth-button google-button"
  onClick={handleGoogleSignIn}
>
  {/* SVG icon stays the same */}
  Continue with Google
</button>
```

---

### 5. Handle OAuth Callback

The AuthContext already handles auth state changes automatically!

When the user returns from Google, Supabase will:
1. ✅ Create the user session
2. ✅ Trigger `onAuthStateChange`
3. ✅ Update your app's auth state
4. ✅ Create user profile (via AuthGate)

---

## 🧪 Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Click "Continue with Google"**

3. **You should:**
   - See Google sign-in popup
   - Be able to select your account
   - Return to InsightAI logged in
   - See the membership page (new users)

---

## ⚠️ Common Issues

### Issue: "Redirect URI mismatch"
**Fix:** Make sure the Supabase callback URL is added to Google Cloud Console

### Issue: "Access blocked: This app's request is invalid"
**Fix:** Complete the OAuth consent screen configuration in Google Cloud

### Issue: User created but no profile
**Fix:** The AuthGate component should auto-create profiles. Check the console for errors.

### Issue: Google button does nothing
**Fix:** Make sure you replaced the `alert()` with the `handleGoogleSignIn` function

---

## 🔒 Security Notes

1. **Never commit credentials:**
   - Client ID and Secret should be in Supabase only
   - Don't hardcode them in your frontend

2. **Use environment variables** (optional):
   ```typescript
   // .env.local (optional, Supabase handles this)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **HTTPS in production:**
   - Always use HTTPS for redirect URIs in production
   - HTTP is only okay for localhost

---

## 📱 Add More Providers

Want to add Apple, Discord, or GitHub sign-in?

Same process:
1. Get OAuth credentials from provider
2. Add to Supabase Authentication → Providers
3. Add button to Login component
4. Call `supabase.auth.signInWithOAuth({ provider: 'apple' })`

---

## 🎯 Summary

After setup, users can:
- ✅ Sign in with Google (one click)
- ✅ Skip email verification
- ✅ Auto-create profiles
- ✅ Access all features immediately

**No additional backend code needed** - Supabase handles everything!

---

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- Google Cloud Docs: https://developers.google.com/identity/protocols/oauth2

The UI is already implemented and ready to go - just complete the setup! 🚀
