# 📸 How to Add Your Logo to the Email Template

## 🎯 **Current Status:**

The template is ready, but you need to upload your logo and update the URL.

**Current placeholder:**
```html
<img src="https://i.imgur.com/YOUR_LOGO_ID.png" alt="InsightAI Logo" class="logo">
```

---

## 🚀 **Option 1: Upload to Imgur (Easiest)**

### **Step 1: Upload Logo**
1. Go to [imgur.com](https://imgur.com)
2. Click "New post"
3. Upload your gradient eye logo (the one from the image)
4. After upload, right-click the image
5. Click "Copy image address"

### **Step 2: Update Template**
1. Open `confirm-signup-clean.html`
2. Find line 154:
   ```html
   <img src="https://i.imgur.com/YOUR_LOGO_ID.png" alt="InsightAI Logo" class="logo">
   ```
3. Replace `https://i.imgur.com/YOUR_LOGO_ID.png` with your copied URL
4. Save the file

### **Step 3: Use in Supabase**
1. Copy the entire updated HTML
2. Paste into Supabase email template
3. Save

---

## 🚀 **Option 2: Host on Your Domain**

If you have the logo hosted on your website:

```html
<img src="https://insight-ai-beta.netlify.app/logo.png" alt="InsightAI Logo" class="logo">
```

---

## 🚀 **Option 3: Use Base64 (No External Hosting)**

### **Step 1: Convert Logo to Base64**
1. Go to [base64-image.de](https://www.base64-image.de/)
2. Upload your logo
3. Copy the base64 string

### **Step 2: Update Template**
```html
<img src="data:image/png;base64,YOUR_BASE64_STRING_HERE" alt="InsightAI Logo" class="logo">
```

**Pros:** No external hosting needed
**Cons:** Makes HTML file larger

---

## 📏 **Logo Specifications:**

For best results, your logo should be:
- **Format:** PNG with transparent background
- **Size:** 160x160px or 240x240px (will be displayed at 80px)
- **File size:** Under 50KB
- **Background:** Transparent (so it looks good on dark card)

---

## 🎨 **Current Template Design:**

```
┌─────────────────────────┐
│    [Your Logo - 80px]   │ ← Replace this
│       InsightAI         │
│                         │
│   Confirm Your Email    │
│                         │
│  Thanks for signing up! │
│                         │
│  [Confirm Email Button] │
│                         │
├─────────────────────────┤
│ © 2024 InsightAI        │
└─────────────────────────┘
```

---

## ✅ **What's Fixed:**

- ✅ White background (not gray)
- ✅ Dark card (gradient purple)
- ✅ Logo ready for your image (not emoji)
- ✅ Removed fallback link section
- ✅ Simple copyright footer
- ✅ Clean, minimal design

---

## 📝 **Quick Checklist:**

1. [ ] Upload your gradient eye logo to Imgur or your server
2. [ ] Copy the image URL
3. [ ] Replace `YOUR_LOGO_ID` in line 154 of the template
4. [ ] Copy entire HTML
5. [ ] Paste into Supabase email template
6. [ ] Save
7. [ ] Test by signing up

---

## 💡 **Pro Tip:**

If you don't have the logo as a separate file yet:
1. Take a screenshot of the gradient eye from your app
2. Use [remove.bg](https://remove.bg) to remove background
3. Upload to Imgur
4. Use that URL

---

**Once you upload the logo and update the URL, the email will be perfect!** 🎉
