# Email Templates for Insight

This folder contains branded email templates for Supabase authentication emails.

## Templates

1. **password-reset.html** - Password reset email
2. **signup-confirmation.html** - Email confirmation for new signups

## How to Update Templates in Supabase

### 1. Go to Supabase Dashboard
- Navigate to your project: https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk
- Go to **Authentication** → **Email Templates**

### 2. Update Password Reset Template
- Find "Reset Password" template
- Copy the contents of `password-reset.html`
- Paste into the template editor
- Click **Save**

### 3. Update Signup Confirmation Template
- Find "Confirm signup" template
- Copy the contents of `signup-confirmation.html`
- Paste into the template editor
- Click **Save**

## Important Notes

### Logo URL
The templates use: `https://myinsightai.app/Insight-Logo-nobg.webp`

Make sure this logo file is accessible at this URL. If you need to change the logo URL, update it in both template files.

### Domain Matching (Resend Recommendation)
Resend recommends that URLs in emails match your sending domain to avoid spam filters.

**Current setup:**
- Sending domain: `myinsightai.app`
- Logo URL: `https://myinsightai.app/Insight-Logo-nobg.webp` ✅
- Footer link: `https://myinsightai.app` ✅

**Supabase confirmation URLs:**
The confirmation URLs will be in this format:
```
https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/verify?token=...&redirect_to=https://myinsightai.app
```

This is normal and expected. The Supabase URL is necessary for authentication, and the `redirect_to` parameter points to your domain.

### Testing
After updating the templates:
1. Run the test script: `node scripts/testEmail.js`
2. Check your email inbox
3. Verify the email looks correct with logo and branding

## Template Features

Both templates include:
- ✅ Insight logo (80px, rounded corners)
- ✅ Brand name "Insight"
- ✅ Purple gradient background (#1a1a2e to #2d1b4e)
- ✅ Purple gradient CTA button
- ✅ Alternative link (in case button doesn't work)
- ✅ Footer with copyright and website link
- ✅ Mobile responsive design
- ✅ Clean, modern styling similar to Discord

## Customization

To customize the templates:
1. Edit the HTML files in this folder
2. Test locally by opening in a browser
3. Copy the updated HTML to Supabase
4. Test with the email test script

### Colors Used
- Background gradient: `#1a1a2e` to `#2d1b4e`
- Button gradient: `#8b5cf6` to `#a78bfa`
- Text: `#ffffff` (white)
- Secondary text: `#d1d5db` (light gray)
- Footer text: `#9ca3af` (gray)
- Links: `#8b5cf6` (purple)
