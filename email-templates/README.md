# 📧 InsightAI Email Templates

Beautiful, branded email templates for InsightAI authentication flows.

---

## 🎨 **Confirm Signup Email**

### **How to Use:**

1. **Go to Supabase Dashboard:**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your InsightAI project
   - Go to **Authentication** → **Email Templates**

2. **Select "Confirm signup" template**

3. **Replace the HTML with:**
   - Copy the entire contents of `confirm-signup.html`
   - Paste it into the Supabase email template editor
   - Click **Save**

---

## ✨ **Features:**

- **🎨 Brand Colors:** Purple gradient matching InsightAI theme
- **👁️ Logo:** Eye emoji representing InsightAI brand
- **📱 Responsive:** Looks great on mobile and desktop
- **🔒 Security Notice:** Reassures users about account security
- **✅ Clear CTA:** Big, prominent "Confirm Your Email" button
- **🌙 Dark Theme:** Matches InsightAI's dark aesthetic
- **💡 Helpful Info:** Explains what happens next

---

## 📋 **Template Variables:**

The template uses Supabase's built-in variables:

- `{{ .ConfirmationURL }}` - The confirmation link (automatically generated)

---

## 🎯 **What Users See:**

1. **Header:** Purple gradient with InsightAI logo and name
2. **Welcome Message:** Friendly greeting
3. **CTA Button:** Large, purple gradient button
4. **Info Box:** Explains why email confirmation is needed
5. **Next Steps:** Clear list of what happens after confirmation
6. **Security Notice:** Blue box with security tip
7. **Fallback Link:** Plain text link if button doesn't work
8. **Footer:** Brand info and links

---

## 🔧 **Customization:**

### **Change Colors:**
```css
/* Primary Purple */
#8b5cf6 → Your color

/* Secondary Blue */
#6366f1 → Your color

/* Background */
#1a1a2e → Your color
```

### **Change Logo:**
Replace the emoji in the header:
```html
<div class="logo">👁️</div>
```

With an image:
```html
<img src="YOUR_LOGO_URL" alt="InsightAI" style="width: 60px; height: 60px;">
```

### **Change Links:**
Update the footer links:
```html
<a href="https://insight-ai-beta.netlify.app">Visit our website</a>
<a href="mailto:support@insightai.com">Contact Support</a>
```

---

## 📸 **Preview:**

The email includes:
- ✅ Branded header with logo
- ✅ Welcoming message
- ✅ Clear call-to-action button
- ✅ Security information
- ✅ Next steps guide
- ✅ Professional footer

---

## 🚀 **Other Templates:**

You can create similar templates for:
- **Password Reset** - Use the same design, change the message
- **Magic Link** - For passwordless login
- **Email Change** - When users update their email

Just copy the structure and update the content!

---

## 💡 **Tips:**

1. **Test the email** by signing up with a test account
2. **Check spam folder** if you don't receive it
3. **Use a real email service** (Gmail, Outlook) to test rendering
4. **Mobile test** - View on phone to ensure responsiveness

---

## 🎨 **Design Philosophy:**

- **Dark theme** matches InsightAI's aesthetic
- **Purple gradient** represents insight and wisdom
- **Clean layout** ensures readability
- **Emoji icons** add personality without images
- **Security-first** messaging builds trust

---

**Enjoy your beautiful branded emails!** 🎉
