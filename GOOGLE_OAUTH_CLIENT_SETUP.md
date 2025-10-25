# 🔐 Google OAuth 2.0 Client ID Setup Guide

## ✅ **You're on the Right Track!**

Yes, you **absolutely need to create an OAuth 2.0 Client ID** for your InsightAI project. Here's exactly what to do:

---

## 📋 **Step-by-Step Setup**

### **1. Create OAuth 2.0 Client ID**

From your Google Cloud Console (you're already in the right place based on Image 5):

1. **Go to:** APIs & Services > Credentials
2. **Click:** "Create Credentials" at the top
3. **Select:** "OAuth 2.0 Client ID"

---

### **2. Configure OAuth Consent Screen (If Not Done)**

If this is your first time, you'll be prompted to configure the consent screen:

**Application Type:** External (for testing) or Internal (for workspace only)

**Fill out:**
- **App name:** InsightAI
- **User support email:** Your email
- **Developer contact email:** Your email
- **Scopes:** Add these for Google Sign-In
  - `openid`
  - `email`
  - `profile`

**Test Users:** Add your email and any other testers

---

### **3. Create OAuth Client**

**Application Type:** Web application

**Name:** InsightAI Web Client (or any descriptive name)

**Authorized JavaScript origins:**
```
http://localhost:5173
http://127.0.0.1:5173
```
*(Add your production domain later)*

**Authorized redirect URIs:**
```
http://localhost:5173
http://localhost:5173/auth/callback
http://127.0.0.1:5173
http://127.0.0.1:5173/auth/callback
```

---

### **4. Get Your Credentials**

After creating the client, you'll receive:

1. **Client ID** - Example: `123456789-abc123.apps.googleusercontent.com`
2. **Client Secret** - Keep this PRIVATE!

**Download the JSON** (optional but recommended for backup)

---

### **5. Add to Your Project**

Create or update your `.env` file:

```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**⚠️ IMPORTANT:** Add `.env` to your `.gitignore` file!

---

## 🔧 **Your Code Integration**

Based on your project structure, you'll use the Client ID in your authentication setup:

```typescript
// Example: src/config/google.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// In your auth component:
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Your app */}
    </GoogleOAuthProvider>
  );
}
```

---

## ✅ **Checklist**

- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins added (localhost:5173)
- [ ] Authorized redirect URIs added
- [ ] Client ID copied to `.env` file
- [ ] Client Secret copied to `.env` file
- [ ] `.env` added to `.gitignore`
- [ ] Google+ API enabled (✅ You already did this!)

---

## 🚨 **Common Issues**

### **"Redirect URI Mismatch" Error**
- Ensure your redirect URI EXACTLY matches what you entered
- Include the port number (`:5173`)
- Check for trailing slashes

### **"Origin Not Allowed" Error**
- Add both `http://localhost:5173` AND `http://127.0.0.1:5173`
- Some browsers use different localhost references

### **Client ID Not Working**
- Make sure you're using the **Client ID**, not the Client Secret in your frontend
- Client Secret should ONLY be used on backend/server

---

## 📱 **Testing**

Once set up, test with:

```typescript
// Test Google Sign-In button
<GoogleLogin
  onSuccess={(credentialResponse) => {
    console.log('Success:', credentialResponse);
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>
```

---

## 🔒 **Security Notes**

1. **Never commit your `.env` file** to Git
2. **Client Secret** should NEVER be exposed in frontend code
3. For production, create a separate OAuth client with your production domain
4. Regularly rotate your Client Secret if exposed

---

## 📚 **Next Steps After Setup**

1. Install Google OAuth library:
   ```bash
   npm install @react-oauth/google
   ```

2. Wrap your app in the provider

3. Implement sign-in/sign-up logic

4. Store user session (localStorage or secure cookies)

5. Test thoroughly before deploying!

---

## 🎯 **Quick Answer to Your Question**

**YES, create a new OAuth 2.0 Client ID!** 

You enabled the Google+ API (✅ good!), now you need the OAuth Client to actually authenticate users. Follow the steps above and you'll be set up in ~5 minutes.

---

**Good luck with your OAuth setup!** 🚀
