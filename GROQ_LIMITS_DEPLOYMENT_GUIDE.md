# Groq API Limits - Deployment Guide 🚀

This guide walks you through deploying the secure Groq API rate limits monitoring system.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. ✅ **Supabase project created**
   - Go to https://supabase.com/dashboard
   - Note your project reference ID

3. ✅ **Groq API key**
   - Get from: https://console.groq.com/keys
   - Copy your API key

4. ✅ **Admin email** (the only user who can access this dashboard)

---

## 🚀 Phase 1: Link Your Supabase Project

Open your terminal in the project directory and run:

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project reference ID (found in your Supabase dashboard URL).

**Example:**
```bash
supabase link --project-ref ptpqvghlaesyrzlljzkk
```

---

## 🔐 Phase 2: Set Secure Environment Variables

These commands securely store your secrets in Supabase (they won't be visible in your code):

### 1. Set Groq API Key:
```bash
supabase secrets set GROQ_API_KEY=gsk_YOUR_ACTUAL_GROQ_API_KEY_HERE
```

**Example:**
```bash
supabase secrets set GROQ_API_KEY=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
```

### 2. Set Admin Email:
```bash
supabase secrets set ADMIN_EMAIL=your_admin_email@example.com
```

**Example:**
```bash
supabase secrets set ADMIN_EMAIL=edwardsjonny547@gmail.com
```

**⚠️ IMPORTANT:** Only the user with this exact email address will be able to access the admin dashboard and view Groq limits.

---

## 📦 Phase 3: Deploy the Edge Function

Deploy the function to Supabase:

```bash
supabase functions deploy get-groq-limits
```

You should see output like:
```
Deploying get-groq-limits (project ref: YOUR_PROJECT_ID)
Bundled get-groq-limits (1.2 KB)
Deployed get-groq-limits (1.2 KB)
```

---

## 🧪 Phase 4: Test the Deployment

### Option A: Test via Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to **Edge Functions**
3. Find `get-groq-limits`
4. Click **Invoke**
5. You should see the rate limit data returned

### Option B: Test via curl (Advanced)

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/get-groq-limits' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json'
```

---

## 🎨 Phase 5: Add Admin Dashboard to Your App

The admin dashboard component has already been created at:
- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/AdminDashboard.css`

### Add Route to Your App

Depending on your routing setup, add a route for the admin dashboard:

#### If using React Router:

```typescript
// In your main routing file (e.g., App.tsx)
import AdminDashboard from './components/admin/AdminDashboard';

// Add this route:
<Route path="/admin" element={<AdminDashboard />} />
```

#### If using your custom routing:

Add the admin view to your navigation system. For example, in your main app component:

```typescript
import AdminDashboard from './components/admin/AdminDashboard';

// Add to your view state:
const [activeView, setActiveView] = useState<'editor' | 'dashboard' | 'settings' | 'playbook' | 'admin'>('dashboard');

// Add to your render logic:
{activeView === 'admin' && <AdminDashboard />}
```

---

## 🔒 Security Features

### ✅ What's Secure:

1. **Admin-Only Access**
   - Only the user with the exact email set in `ADMIN_EMAIL` can access the dashboard
   - All other users get a 401 Unauthorized error

2. **Secrets Management**
   - Groq API key is stored securely in Supabase secrets
   - Never exposed to the frontend
   - Only accessible by the Edge Function

3. **Authentication Required**
   - User must be logged in with a valid Supabase session
   - Session token is verified on every request

4. **Server-Side Execution**
   - All Groq API calls happen server-side (in the Edge Function)
   - Frontend never has direct access to the Groq API key

---

## 📊 Using the Admin Dashboard

### Accessing the Dashboard:

1. **Log in** to your InsightAI app with the admin email
2. Navigate to `/admin` (or however you set up the route)
3. The dashboard will automatically load the current Groq API limits

### Dashboard Features:

- **Remaining Requests**: Number of API calls left before hitting the limit
- **Remaining Tokens**: Total tokens (input + output) available
- **Reset Time**: When your limits will refresh
- **Refresh Button**: Manually reload the latest limits
- **Last Updated**: Timestamp of the last successful fetch

### What the Numbers Mean:

- **Requests**: Each AI analysis call counts as 1 request
- **Tokens**: Each word/piece of text uses tokens (input + output combined)
- **Reset**: Groq limits typically reset every minute or hour depending on your tier

---

## 🐛 Troubleshooting

### Error: "Not authorized"

**Cause:** You're not logged in with the admin email

**Fix:**
1. Make sure you're logged in
2. Verify your email matches the `ADMIN_EMAIL` secret exactly
3. Check the secret: `supabase secrets list`

### Error: "Groq API error"

**Cause:** Issue with the Groq API key or Groq service

**Fix:**
1. Verify your Groq API key is correct
2. Check Groq's status page: https://status.groq.com/
3. Re-set the secret: `supabase secrets set GROQ_API_KEY=your_key`

### Error: "Failed to fetch limits"

**Cause:** Network or Edge Function issue

**Fix:**
1. Check your internet connection
2. Verify the Edge Function is deployed: `supabase functions list`
3. Check Edge Function logs in Supabase dashboard

### Edge Function Not Found

**Cause:** Function not deployed or wrong project

**Fix:**
1. Verify you're linked to the correct project: `supabase projects list`
2. Re-deploy: `supabase functions deploy get-groq-limits`

---

## 🔄 Updating the Function

If you need to modify the Edge Function:

1. Edit `supabase/functions/get-groq-limits/index.ts`
2. Re-deploy:
   ```bash
   supabase functions deploy get-groq-limits
   ```

---

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `GROQ_API_KEY` | Your Groq API key | `gsk_ABC123...` |
| `ADMIN_EMAIL` | Admin user's email | `admin@example.com` |
| `SUPABASE_URL` | Auto-set by Supabase | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase | `eyJhbGc...` |

---

## 🎯 Next Steps

1. ✅ Deploy the Edge Function
2. ✅ Set the secrets
3. ✅ Test the function
4. ✅ Add the admin dashboard to your app
5. ✅ Log in with the admin email
6. ✅ Navigate to the admin dashboard
7. ✅ View your Groq API limits!

---

## 📚 Additional Resources

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Groq API Docs**: https://console.groq.com/docs
- **Supabase CLI Reference**: https://supabase.com/docs/reference/cli

---

## 🆘 Need Help?

If you encounter issues:

1. Check the Edge Function logs in your Supabase dashboard
2. Verify all secrets are set correctly: `supabase secrets list`
3. Test the function directly in the Supabase dashboard
4. Check browser console for frontend errors

---

## 🎉 Success!

Once deployed, you'll have a secure, real-time view of your Groq API usage limits. This helps you:

- **Monitor usage** to avoid hitting rate limits
- **Plan scaling** based on actual usage patterns
- **Debug issues** related to API limits
- **Optimize** your AI analysis calls

Happy monitoring! 🚀
