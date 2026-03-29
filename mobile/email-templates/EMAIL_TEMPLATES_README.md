# Email Templates

These templates power the Supabase auth emails used by the mobile app.

## Active templates

### `otp-verification-v2.html`
- Use for `Confirm signup`
- Shows a 6-digit verification code with `{{ .Token }}`

### `password-reset-v2.html`
- Use for `Reset Password`
- Shows a 6-digit recovery code with `{{ .Token }}`
- Matches the in-app password recovery flow in `ForgotPasswordScreen`

## Supabase setup

1. Open Supabase Dashboard for the project.
2. Go to `Authentication` -> `Email Templates`.
3. Paste `otp-verification-v2.html` into `Confirm signup`.
4. Paste `password-reset-v2.html` into `Reset Password`.
5. Save both templates.

## Important variables

- Signup verification: `{{ .Token }}`
- Password recovery: `{{ .Token }}`

The mobile app now uses in-app code entry for both signup verification and password reset. Do not document or rely on `{{ .ConfirmationURL }}` for password recovery anymore.

## Testing

1. Run `node scripts/testEmail.js`.
2. Trigger a signup email and confirm a 6-digit code arrives.
3. Trigger a password reset from `Forgot Password` and confirm a 6-digit recovery code arrives.
4. Verify the copy tells users to enter the code inside the app.

## Notes

- `password-reset.html` and `password-reset-v2.html` now both use the same recovery-code approach.
- The templates use a public Insight logo URL that works in email clients.
- If delivery fails, check Supabase auth logs, SMTP settings, and Resend logs.
