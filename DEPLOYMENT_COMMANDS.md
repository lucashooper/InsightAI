# Quick Deployment Commands 🚀

Copy and paste these commands in order. Replace the placeholder values with your actual data.

---

## Step 1: Link Supabase Project

```bash
supabase link --project-ref ptpqvghlaesyrzlljzkk
```

---

## Step 2: Set Secrets

### Set Groq API Key:
```bash
supabase secrets set GROQ_API_KEY=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
```

### Set Admin Email:
```bash
supabase secrets set ADMIN_EMAIL=edwardsjonny547@gmail.com
```

---

## Step 3: Deploy Function

```bash
supabase functions deploy get-groq-limits
```

---

## Step 4: Verify Deployment

### List all functions:
```bash
supabase functions list
```

### List all secrets:
```bash
supabase secrets list
```

---

## ✅ Done!

Your Edge Function is now deployed and ready to use.

Access the admin dashboard at: `http://localhost:5173/admin` (or your production URL)

---

## 🔄 Update Function (if needed)

If you make changes to the function code:

```bash
supabase functions deploy get-groq-limits
```

---

## 🗑️ Delete Function (if needed)

```bash
supabase functions delete get-groq-limits
```

---

## 📊 View Logs

```bash
supabase functions logs get-groq-limits
```

Or view in dashboard: https://supabase.com/dashboard/project/ptpqvghlaesyrzlljzkk/functions
