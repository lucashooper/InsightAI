# 🚨 Fix Google OAuth "redirect_uri_mismatch" Error

## The Problem
```
Error 400: redirect_uri_mismatch
```

This means the redirect URI in your Google Cloud Console doesn't match what Supabase is sending.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select your project (the one with Client ID: `83428014674-9k0r83orqdsca21amou6iavk5icae6ch`)
3. Go to **APIs & Services** → **Credentials**

### Step 2: Edit OAuth Client
1. Find your OAuth 2.0 Client ID
2. Click the **pencil icon** (Edit)
3. Scroll to **Authorized redirect URIs**

### Step 3: Add the Correct Redirect URI
Add this EXACT URL:
```
https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback
```

**Also add (for development):**
```
http://localhost:5173
```

### Step 4: Save
Click **Save** at the bottom

---

## 🧪 Test It

1. Restart your dev server (just to be safe)
2. Go to login page
3. Click "Sign in with Google"
4. Should work now! ✅

---

## Why This Happened

When you use Supabase OAuth:
1. Your app redirects to Google
2. Google redirects to **Supabase** (not your app directly)
3. Supabase handles the token exchange
4. Supabase redirects back to your app

So the redirect URI must be the **Supabase callback URL**, not your localhost URL!

---

## Still Not Working?

### Check Supabase Configuration
1. Go to: https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk
2. Navigate to **Authentication** → **Providers**
3. Find **Google**
4. Make sure it's **enabled**
5. Verify your Client ID and Secret are correct

### Check Console for Errors
Open browser console (F12) and look for any error messages.

---

## Summary

**What to add to Google Cloud Console:**
```
✅ https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback
✅ http://localhost:5173
```

**What NOT to add:**
```
❌ http://localhost:5173/auth/callback (not needed with Supabase)
```

That's it! Google OAuth should work now. 🎉
