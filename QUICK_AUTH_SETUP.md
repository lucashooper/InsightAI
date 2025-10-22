# Quick Authentication Setup Guide

## 🚨 Fixing the 400 & 401 Errors

The errors you're seeing mean you need to run the database setup. Follow these steps:

### Step 1: Disable Email Confirmation (For Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings** (or **Providers**)
3. Find **Email** section
4. **Turn OFF** "Confirm email"
5. Click **Save**

This allows instant signup without email confirmation during development.

### Step 2: Run the Database SQL

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the ENTIRE contents from:
   - `database/user_profiles_table.sql`
4. Click **Run** or press **Ctrl+Enter**

Wait for "Success. No rows returned" message.

### Step 3: Create Storage Bucket (For Profile Pictures)

1. Go to **Storage** in Supabase
2. Click **New bucket**
3. Name: `profile-pictures`
4. Make it **Public** ✅
5. Click **Create**

### Step 4: Add Storage Policies

1. Select the `profile-pictures` bucket
2. Click **Policies**
3. Click **New Policy**
4. Choose **For full customization** → **Create policy**

Add these **4 policies**:

#### Policy 1: Upload
```sql
CREATE POLICY "Users can upload profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');
```

#### Policy 2: View
```sql
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

#### Policy 3: Update
```sql
CREATE POLICY "Users can update profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

#### Policy 4: Delete
```sql
CREATE POLICY "Users can delete profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');
```

### Step 5: Verify Environment Variables

Check your `.env.local` file has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Find these in Supabase:**
- Dashboard → **Settings** → **API**
- Copy "Project URL" and "anon public" key

### Step 6: Test Signup

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Click "Sign up"

4. Fill in:
   - Username: testuser
   - Email: test@test.com
   - Password: test123

5. Click "Sign Up"

6. You should see the Welcome screen! 🎉

---

## 🐛 Still Getting Errors?

### Error: "Please check your email to confirm"
- **Fix:** Go back to Step 1 and disable email confirmation

### Error: "relation 'user_profiles' does not exist"
- **Fix:** Run the SQL from Step 2 again

### Error: "new row violates row-level security policy"
- **Fix:** Check that the SQL script from Step 2 ran completely
- The script should create RLS policies automatically

### Error: 401 when creating profile
- **Fix:** The RLS policies might not be set up correctly
- Run this in SQL Editor:
  ```sql
  -- Check if policies exist
  SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
  ```
- If no results, re-run the SQL from Step 2

---

## ✅ What Changed in the Code

1. **Login/Signup UI**
   - Centered auth cards
   - Premium gradient background with grain effect
   - Password visibility toggle (eye icon)

2. **Better Error Handling**
   - Handles email confirmation requirement
   - Creates profile on first login if missing
   - Better error messages

3. **Supabase Integration**
   - Profile auto-creation on signup
   - Fallback profile creation on login
   - Proper RLS security

---

## 📸 Expected Result

After setup, you should see:
- ✅ Beautiful centered login/signup screens
- ✅ Password eye toggle working
- ✅ No console errors
- ✅ Welcome screen after signup
- ✅ App loads correctly

---

**Need help? Check the console for specific error messages!**
