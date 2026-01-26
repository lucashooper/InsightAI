# OTP-Based Authentication Setup Guide

This guide explains how to configure Supabase to use OTP (One-Time Password) codes instead of magic links for email verification and password reset.

## Why OTP Instead of Magic Links?

**Magic Links (Current):**
- ❌ User must leave the app
- ❌ Opens email → browser → redirects back to app
- ❌ Deep linking can be unreliable
- ❌ Poor mobile UX

**OTP Codes (New):**
- ✅ User stays in the app
- ✅ Simple 6-digit code entry
- ✅ No browser redirects
- ✅ Better UX (like Candle, Discord, etc.)
- ✅ More reliable

## What We've Implemented

### 1. Email Verification (Signup)
- User signs up with email/password
- Supabase sends 6-digit OTP code via email
- User enters code in `VerifyEmailScreen`
- Email is verified, user is logged in

### 2. Password Reset (Coming Next)
- User requests password reset
- Custom OTP system sends 6-digit code
- User enters code
- User sets new password

## Supabase Configuration Steps

### Step 1: Enable OTP in Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider
4. Enable these settings:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (this enables OTP)
   - ✅ **Secure email change**

### Step 2: Update Email Template for OTP

1. Go to **Authentication** → **Email Templates**
2. Find **"Confirm signup"** template
3. Replace with the contents of `/mobile/email-templates/otp-verification.html`
4. **Important:** The template uses `{{ .Token }}` to display the OTP code
5. Click **Save**

### Step 3: Configure SMTP Settings

Make sure your SMTP settings are correct (from previous setup):

```
Enable Custom SMTP: ON
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Your Resend API key]
Sender: noreply@myinsightai.app
Sender name: Insight
```

### Step 4: Test OTP Flow

Run the test to verify OTP emails are sent:

```bash
cd mobile
node scripts/testEmail.js
```

Or test in the app:
1. Open app
2. Go to Sign Up
3. Enter email/password
4. Check email for 6-digit code
5. Enter code in verification screen

## How It Works in the App

### Signup Flow

```
SignupScreen
    ↓ (user enters email/password)
    ↓ calls supabase.auth.signUp()
    ↓ Supabase sends OTP email
    ↓
VerifyEmailScreen
    ↓ (user enters 6-digit code)
    ↓ calls supabase.auth.verifyOtp()
    ↓ Email verified
    ↓
MainTabs (logged in)
```

### Components Created

1. **`OTPInput.tsx`** - Reusable 6-digit code input component
2. **`VerifyEmailScreen.tsx`** - Screen for entering OTP code
3. **Updated `SignupScreen.tsx`** - Navigates to verification after signup

## Important Notes

### Email Confirmation Required

For OTP to work, Supabase must be configured to require email confirmation:

- Go to **Authentication** → **Providers** → **Email**
- Make sure **"Confirm email"** is **ENABLED**
- If disabled, users will be auto-logged in without verification

### OTP Expiration

- OTP codes expire after **10 minutes** (configurable in Supabase)
- Users can request a new code using the "Resend" button
- Resend has a 60-second cooldown to prevent spam

### Rate Limiting

Supabase has built-in rate limiting for OTP:
- Maximum 5 OTP requests per hour per email
- This prevents abuse

## Password Reset with OTP (Next Step)

Supabase doesn't natively support OTP for password reset, so we need a custom solution:

### Option 1: Keep Magic Links for Password Reset
- Simplest approach
- Use OTP for signup, magic links for password reset
- Still better than all magic links

### Option 2: Custom OTP System (Recommended)
- Create database table for password reset codes
- Generate 6-digit codes
- Send via Resend API directly
- Verify codes manually
- Update password via Supabase

**I recommend Option 2 for consistency.** Would you like me to implement this?

## Testing Checklist

- [ ] Signup sends OTP email
- [ ] OTP email has correct branding
- [ ] OTP code works in verification screen
- [ ] Invalid code shows error
- [ ] Expired code shows error
- [ ] Resend button works
- [ ] User is logged in after verification
- [ ] Navigation works correctly

## Troubleshooting

### OTP Email Not Received

1. Check Supabase Auth Logs for errors
2. Verify SMTP settings are correct
3. Check spam folder
4. Verify domain is verified in Resend
5. Run test script: `node scripts/testEmail.js`

### "Email not confirmed" Error

This means the user signed up but didn't verify their email. They need to:
1. Request a new verification code
2. Or use the resend function

### Deep Links Still Needed?

No! With OTP, you don't need deep linking for email verification. However, you might still want it for:
- Password reset (if using magic links)
- Social auth redirects
- Universal links for sharing

## Next Steps

1. **Test the OTP signup flow** in the app
2. **Update email template** in Supabase with OTP template
3. **Decide on password reset approach** (magic link or custom OTP)
4. **Implement password reset OTP** if desired
5. **Test thoroughly** before submitting to App Store

---

## Summary

✅ **Implemented:**
- OTP-based email verification for signup
- 6-digit code input component
- Verification screen with resend functionality
- Branded OTP email template

⏳ **Next:**
- Custom OTP system for password reset (optional but recommended)
- Testing and refinement

🎯 **Result:**
- Better mobile UX
- No browser redirects
- Stays in-app
- More reliable than magic links
