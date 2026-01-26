# Email Templates - Updated (Discord Style)

Clean, simple email templates inspired by Discord's design with white background and minimal styling.

## New Templates (v2)

### 1. OTP Verification Email (`otp-verification-v2.html`)
- **Use for:** Email verification during signup
- **Features:**
  - Clean white background
  - Logo at top (64px)
  - Large 6-digit code display
  - Simple, readable typography
  - Mobile responsive

### 2. Password Reset Email (`password-reset-v2.html`)
- **Use for:** Password reset requests
- **Features:**
  - Clean white background
  - Logo at top (64px)
  - Blue CTA button
  - Alternative link option
  - Mobile responsive

## Logo URL

**Working URL:** `https://i.imgur.com/etlu4ls.png`

This is a public Imgur link that will load correctly in all email clients.

## How to Update in Supabase

### Step 1: Go to Email Templates

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Signup Confirmation (OTP)

1. Find **"Confirm signup"** template
2. Copy contents of `otp-verification-v2.html`
3. Paste into template editor
4. Click **Save**

### Step 3: Update Password Reset

1. Find **"Reset Password"** template
2. Copy contents of `password-reset-v2.html`
3. Paste into template editor
4. Click **Save**

## Design Changes from Previous Version

### Before (Dark Theme)
- ❌ Dark purple gradient background
- ❌ "Insight" heading below logo
- ❌ Fancy typography
- ❌ Logo not loading (wrong URL)

### After (Discord Style)
- ✅ Clean white background
- ✅ Logo only (no text heading)
- ✅ Simple, readable typography
- ✅ Working logo URL (Imgur)
- ✅ Light gray footer section
- ✅ Professional and clean

## Typography

**Fonts:**
- System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`
- Code font (for OTP): `'Courier New', Courier, monospace`

**Colors:**
- Background: `#f6f6f6` (light gray)
- Card: `#ffffff` (white)
- Primary text: `#060607` (almost black)
- Secondary text: `#4e5058` (gray)
- Tertiary text: `#747f8d` (light gray)
- Accent: `#5865f2` (Discord blue)
- Code background: `#f2f3f5` (very light gray)

## Email Client Compatibility

These templates are tested and work in:
- ✅ Gmail (web, iOS, Android)
- ✅ Apple Mail (macOS, iOS)
- ✅ Outlook (web, desktop)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ All major mobile email apps

## Testing

After updating templates in Supabase:

```bash
# Test signup with OTP
1. Open app
2. Go to Sign Up
3. Enter username → email → password
4. Check email for 6-digit code
5. Verify logo loads correctly
6. Verify clean white design

# Test password reset
1. Go to Login
2. Click "Forgot Password?"
3. Enter email
4. Check email for reset link
5. Verify logo loads correctly
6. Verify clean white design
```

## Template Variables

### OTP Verification
- `{{ .Token }}` - The 6-digit verification code

### Password Reset
- `{{ .ConfirmationURL }}` - The password reset link

## Mobile Responsive

Both templates automatically adjust for mobile:
- Smaller logo (56px on mobile)
- Adjusted padding
- Smaller font sizes
- Optimized for small screens

## Comparison with Discord

Our templates follow Discord's email design principles:
- ✅ White background
- ✅ Minimal branding (logo only)
- ✅ Clear hierarchy
- ✅ Simple typography
- ✅ Clean footer
- ✅ Professional appearance

## Old Templates (Deprecated)

The following templates are now deprecated:
- `otp-verification.html` (dark theme)
- `password-reset.html` (dark theme)
- `signup-confirmation.html` (dark theme)

Keep these for reference but use the v2 templates going forward.

## Support

If emails are not sending:
1. Check Supabase Auth logs
2. Verify SMTP settings (Resend)
3. Check spam folder
4. Verify domain is verified in Resend
5. Run test script: `node scripts/testEmail.js`

## Summary

✅ **Clean Discord-style design**  
✅ **Working logo URL (Imgur)**  
✅ **Simple, professional typography**  
✅ **Mobile responsive**  
✅ **Email client compatible**  
✅ **Easy to read and understand**
