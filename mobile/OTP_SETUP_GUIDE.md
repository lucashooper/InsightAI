# OTP-Based Authentication Setup Guide

This app now uses in-app 6-digit codes for both signup verification and password recovery.

## Why this approach

- Users stay inside the app instead of bouncing through Mail, Safari, and a deep link.
- The UI is consistent across signup and password reset.
- It removes the simulator and mobile-browser flakiness that came with link redirects.

## Current flows

### Signup verification
- `supabase.auth.signUp()` sends a 6-digit code
- Users enter it in `VerifyEmailScreen`
- The app verifies with `supabase.auth.verifyOtp({ type: 'signup' })`

### Password recovery
- `ForgotPasswordScreen` calls `supabase.auth.resetPasswordForEmail(email)`
- The reset email shows `{{ .Token }}`
- Users enter the code in-app
- The app verifies with `supabase.auth.verifyOtp({ type: 'recovery' })`
- The app updates the password with `supabase.auth.updateUser({ password })`

## Supabase configuration

### 1. Email provider

In `Authentication` -> `Providers` -> `Email`, make sure these are enabled:
- `Enable Email provider`
- `Confirm email`
- `Secure email change`

### 2. Email templates

In `Authentication` -> `Email Templates`:
- `Confirm signup` should use `/mobile/email-templates/otp-verification-v2.html`
- `Reset Password` should use `/mobile/email-templates/password-reset-v2.html`

Both templates should rely on `{{ .Token }}`.

### 3. SMTP

Use your normal SMTP configuration, for example:

```text
Enable Custom SMTP: ON
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Your Resend API key]
Sender: noreply@myinsightai.app
Sender name: Insight
```

## Testing

```bash
cd mobile
node scripts/testEmail.js
```

Then test both flows in the app:

1. Sign up with email/password and confirm the verification code arrives.
2. Use `Forgot Password` and confirm the recovery code arrives.
3. Verify invalid codes show errors.
4. Verify resend works after cooldown.
5. Verify password update returns the user cleanly to sign in.

## Notes

- Password recovery no longer depends on `redirectTo` or browser deep links.
- You may still want deep links for social auth or general app links, but not for email verification or password reset.
- If emails are not sending, check Supabase auth logs, SMTP settings, and Resend logs.
