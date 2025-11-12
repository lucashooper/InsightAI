# 🔍 Debugging Admin Dashboard

## ✅ What I Just Fixed:

### 1. **Added Better Error Logging**
- Edge Function now logs detailed errors
- Frontend logs the full response
- You can see exactly what's failing

### 2. **Fixed TypeScript Error**
- Fixed `error.message` type issue in Edge Function
- Added proper error handling

### 3. **Added API Key Validation**
- Checks if `GROQ_API_KEY` is configured
- Returns clear error if missing

### 4. **Redeployed**
- Function is live with improved logging

---

## 🧪 How to Debug:

### **Step 1: Refresh the Admin Dashboard**
```
Ctrl + Shift + R (hard refresh)
```

### **Step 2: Open Browser Console**
```
Press F12
Go to "Console" tab
```

### **Step 3: Look for Logs**

You should see:
```javascript
Edge Function Response: { data: {...}, error: null }
```

If there's an error, you'll see:
```javascript
Edge Function Error Details: { message: "..." }
```

---

## 🔍 Common Errors & Solutions:

### **Error: "Not authorized"**
**Cause:** You're not logged in with the admin email

**Solution:**
1. Log out
2. Log in with: **edwardsjonny547@gmail.com**
3. Try again

---

### **Error: "GROQ_API_KEY not configured"**
**Cause:** The Groq API key secret is missing

**Solution:**
```bash
npx supabase secrets set GROQ_API_KEY=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
```

---

### **Error: "Groq API error (401)"**
**Cause:** Invalid Groq API key

**Solution:**
1. Get a new API key from https://console.groq.com/keys
2. Update the secret:
   ```bash
   npx supabase secrets set GROQ_API_KEY=your_new_key
   ```

---

### **Error: "Groq API error (429)"**
**Cause:** You've hit Groq's rate limit

**Solution:**
- Wait for the rate limit to reset (usually 1 minute)
- The dashboard will show when it resets

---

### **Error: "User not found or invalid token"**
**Cause:** Session expired or not logged in

**Solution:**
1. Log out
2. Log in again
3. Try accessing admin dashboard

---

## 📊 What to Check in Console:

### **1. Edge Function Response:**
```javascript
Edge Function Response: {
  data: {
    remainingRequests: "30",
    remainingTokens: "6000",
    requestsReset: "1m"
  },
  error: null
}
```
✅ **This means it's working!**

---

### **2. Edge Function Error:**
```javascript
Edge Function Error Details: {
  message: "Not authorized"
}
```
❌ **Check your login email**

---

### **3. Groq API Error:**
```javascript
Edge Function returned error: "Groq API error (401): Invalid API key"
```
❌ **Check your Groq API key**

---

## 🛠️ Advanced Debugging:

### **Check Edge Function Logs:**
1. Go to: https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk/functions
2. Click on `get-groq-limits`
3. Click "Logs" tab
4. See server-side logs

You should see:
```
Calling Groq API...
Groq API Response Status: 200
```

---

### **Verify Secrets:**
```bash
npx supabase secrets list
```

Should show:
```
GROQ_API_KEY
ADMIN_EMAIL
```

---

### **Test Function Manually:**

In Supabase Dashboard:
1. Go to Edge Functions
2. Click `get-groq-limits`
3. Click "Invoke"
4. See the response

---

## 📝 Checklist:

Before asking for help, verify:

- [ ] Logged in with **edwardsjonny547@gmail.com**
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked browser console (F12)
- [ ] Verified secrets are set (`npx supabase secrets list`)
- [ ] Function is deployed (`npx supabase functions list`)
- [ ] Checked Edge Function logs in Supabase dashboard

---

## 🎯 Expected Behavior:

When everything works:

1. **Click Admin button** → Dashboard loads
2. **See 3 cards** with:
   - Remaining Requests
   - Remaining Tokens
   - Reset Time
3. **Click Refresh** → Data updates
4. **No errors** in console

---

## 🆘 Still Having Issues?

### **Copy this info:**

1. **Browser Console Output:**
   - Open Console (F12)
   - Copy all logs related to "groqLimitsService" or "AdminDashboard"

2. **Edge Function Logs:**
   - Go to Supabase Dashboard → Functions → get-groq-limits → Logs
   - Copy recent logs

3. **Your Email:**
   - What email are you logged in with?

4. **Secrets Status:**
   - Run: `npx supabase secrets list`
   - Copy output (don't share the actual keys!)

---

## ✨ Success Indicators:

You'll know it's working when:

✅ No CORS errors
✅ No "non-2xx status code" errors
✅ Console shows: `Edge Function Response: { data: {...}, error: null }`
✅ Dashboard displays 3 cards with numbers
✅ Refresh button updates the data

---

**Happy debugging! 🚀**
