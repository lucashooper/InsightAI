# Email Templates for Insight

This folder contains the Supabase auth email templates used by the mobile app.

## Templates

1. `otp-verification-v2.html` for signup verification
2. `password-reset-v2.html` for password recovery
3. `password-reset.html` as a matching recovery-code fallback copy

## Supabase template mapping

- `Confirm signup` -> `otp-verification-v2.html`
- `Reset Password` -> `password-reset-v2.html`

The reset flow is now code-based. The email should show `{{ .Token }}` and tell the user to enter the code inside the app. Do not rely on browser links for recovery.

## Updating templates

1. Open Supabase Dashboard.
2. Go to `Authentication` -> `Email Templates`.
3. Paste the correct file into the matching template.
4. Save.

## Testing

1. Run `node scripts/testEmail.js`.
2. Trigger both signup verification and password recovery emails.
3. Confirm each email contains a 6-digit code and correct Insight branding.

## Notes

- The templates use a public Insight logo URL for email-client compatibility.
- SMTP and delivery issues should be checked in Supabase auth logs and Resend logs.
