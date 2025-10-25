# 🔧 Fix: "Provider is not enabled" Error

## ❌ **The Problem**

You're getting this error:
```
Provider (issuer "https://accounts.google.com") is not enabled
```

**This means:** Google OAuth is NOT enabled in your Supabase project settings.

---

## ✅ **Solution: Enable Google OAuth in Supabase**

### **Step 1: Go to Supabase Dashboard**

1. Open: https://supabase.com/dashboard
2. Select your project: `InsightAI` (or whatever it's called)
3. Go to: **Authentication** → **Providers** (in the left sidebar)

---

### **Step 2: Enable Google Provider**

1. Scroll down to find **Google** in the providers list
2. Click on **Google** to expand it
3. Toggle the switch to **ENABLED** ✅

---

### **Step 3: Configure Google Provider**

You'll need to enter your Google OAuth credentials:

**Client ID (OAuth 2.0):**
```
83428014674-9k0r83orqdsca21amou6iavk5icae6ch.apps.googleusercontent.com
```

**Client Secret (OAuth 2.0):**
```
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
```

**Authorized redirect URIs:**

Supabase will show you the redirect URI to use. It will look like:
```
https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback
```

---

### **Step 4: Update Google Cloud Console**

Now go back to Google Cloud Console and add the Supabase redirect URI:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback
   ```
   (Replace with YOUR Supabase project URL)

4. **Also make sure these are there:**
   ```
   http://localhost:5174
   http://localhost:5174/auth/callback
   http://127.0.0.1:5174
   ```

5. Click **SAVE**

---

### **Step 5: Update Authorized JavaScript Origins**

In the same Google OAuth client settings:

**Authorized JavaScript origins** should have:
```
http://localhost:5174
http://127.0.0.1:5174
https://ptpqvghlaesyrzlljzkk.supabase.co
```

---

## 🔧 **Fix the Origin Error**

The error `"The given origin is not allowed for the given client ID"` means:

Your current port is **5174**, but you might have configured **5173** in Google Cloud.

### **Check Your Current Port**

Look at your terminal - it says:
```
Local:   http://localhost:5174/
```

### **Update Google Cloud Console**

Add BOTH ports to be safe:

**Authorized JavaScript origins:**
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

**Authorized redirect URIs:**
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `https://ptpqvghlaesyrzlljzkk.supabase.co/auth/v1/callback`

---

## 📋 **Complete Checklist**

### **Supabase Dashboard:**
- [ ] Go to Authentication → Providers
- [ ] Enable **Google** provider
- [ ] Enter Client ID: `83428014674-9k0r83orqdsca21amou6iavk5icae6ch.apps.googleusercontent.com`
- [ ] Enter Client Secret: `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`
- [ ] Copy the Supabase callback URL (shown in the settings)
- [ ] Click **Save**

### **Google Cloud Console:**
- [ ] Go to APIs & Services → Credentials
- [ ] Click your OAuth 2.0 Client ID
- [ ] Add Authorized JavaScript origins:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://127.0.0.1:5173`
  - `http://127.0.0.1:5174`
  - `https://ptpqvghlaesyrzlljzkk.supabase.co`
- [ ] Add Authorized redirect URIs:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://127.0.0.1:5173`
  - `http://127.0.0.1:5174`
  - `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
- [ ] Click **SAVE**

---

## 🧪 **Test Again**

1. Wait 1-2 minutes for Google/Supabase to propagate changes
2. Clear your browser cache or use Incognito mode
3. Refresh your app: `http://localhost:5174`
4. Click "Continue with Google"
5. It should work now! ✅

---

## 🐛 **Still Not Working?**

### **Check Supabase Auth Settings**

1. In Supabase Dashboard → Authentication → URL Configuration
2. Make sure **Site URL** is set to: `http://localhost:5174`
3. Add to **Redirect URLs**:
   ```
   http://localhost:5174/**
   http://localhost:5173/**
   ```

### **Check Browser Console**

After clicking Google button:
- ✅ Should open Google popup
- ✅ Should NOT show origin errors
- ✅ Should redirect back to your app

### **Common Issues**

| Error | Solution |
|-------|----------|
| "Origin not allowed" | Add localhost:5174 to Google Console |
| "Provider not enabled" | Enable Google in Supabase Auth settings |
| "Redirect URI mismatch" | Add Supabase callback URL to Google |
| "Invalid client" | Double-check Client ID in Supabase |

---

## 📸 **Visual Guide**

### **Supabase - Where to Enable Google:**

```
Supabase Dashboard
└── Your Project
    └── Authentication (left sidebar)
        └── Providers
            └── Google
                ├── [Toggle: ENABLED ✅]
                ├── Client ID: [paste here]
                ├── Client Secret: [paste here]
                └── [Save]
```

### **Google Cloud Console - Where to Add URIs:**

```
Google Cloud Console
└── APIs & Services
    └── Credentials
        └── OAuth 2.0 Client IDs
            └── [Your Client]
                ├── Authorized JavaScript origins
                │   └── [Add localhost:5174, etc.]
                └── Authorized redirect URIs
                    └── [Add Supabase callback, etc.]
```

---

## ✅ **After Setup**

Once configured correctly:
1. User clicks "Continue with Google"
2. Google OAuth popup opens
3. User selects account
4. Supabase receives token
5. User profile created
6. User signed in ✅

**The flow will work seamlessly!** 🚀
