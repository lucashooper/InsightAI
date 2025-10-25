# 🗑️ Delete Account Setup Instructions

## ⚠️ **Why It's Not Working**

The delete account feature requires **admin privileges** to delete auth users. Client-side JavaScript cannot delete auth accounts for security reasons.

**You need to set up a Supabase RPC function** that runs with elevated privileges.

---

## ✅ **Setup Instructions**

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your **InsightAI** project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

---

### **Step 2: Run the SQL Function**

Copy and paste this SQL code:

```sql
-- Create a function to delete the current user's account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the current user's ID from the JWT
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Delete user's profile
  DELETE FROM user_profiles WHERE user_profiles.user_id = delete_user.user_id;
  
  -- Delete user's diary entries (if table exists)
  BEGIN
    DELETE FROM diary_entries WHERE diary_entries.user_id = delete_user.user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL; -- Table doesn't exist yet, skip
  END;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Account deleted successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
```

---

### **Step 3: Click "Run"**

Click the **Run** button (or press `Ctrl+Enter`)

You should see:
```
Success. No rows returned
```

---

### **Step 4: Test Delete Account**

1. Go back to your app
2. Go to **Settings**
3. Click **Delete Account**
4. Confirm deletion
5. ✅ Account should be deleted successfully!

---

## 🔧 **How It Works**

### **The Function:**

```sql
CREATE FUNCTION delete_user()
SECURITY DEFINER  ← This is KEY! Runs with elevated privileges
```

**What it does:**
1. Gets current user ID from JWT token
2. Deletes user profile from `user_profiles` table
3. Deletes diary entries (if table exists)
4. Deletes auth user from `auth.users` table
5. Returns success/error JSON

**Security:**
- Only the authenticated user can delete their own account
- Uses `auth.uid()` to get current user
- Cannot delete other users' accounts

---

## 🐛 **If It Still Doesn't Work**

### **Check 1: Function Exists**

Run this query in SQL Editor:
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'delete_user';
```

Should return 1 row with the function.

### **Check 2: Permissions**

Run this query:
```sql
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'delete_user';
```

Should show `authenticated` has `EXECUTE` permission.

### **Check 3: Test Manually**

Run this in SQL Editor while logged in:
```sql
SELECT delete_user();
```

Should return:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 📝 **Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| "Function delete_user() does not exist" | SQL not run | Run the SQL in Step 2 |
| "Permission denied" | Wrong privileges | Check GRANT statement |
| "Not authenticated" | Not logged in | Make sure user is signed in |
| "Failed to delete account" | Generic error | Check Supabase logs |

---

## 🔍 **View Supabase Logs**

To see detailed error messages:

1. Go to Supabase Dashboard
2. Click **Logs** → **Postgres Logs**
3. Try to delete account
4. Check logs for detailed error

---

## ✅ **Verification**

After setting up, the delete flow should be:

1. User clicks "Delete Account" → "Confirm Delete?"
2. App calls `supabase.rpc('delete_user')`
3. Function runs with admin privileges
4. Deletes profile, entries, and auth user
5. User signed out automatically
6. ✅ Account completely removed

---

## 🚨 **Important Notes**

1. **This is permanent!** Deleted accounts cannot be recovered
2. **All data is removed:** Profile, entries, auth account
3. **User is signed out** immediately after deletion
4. **localStorage is cleared** on the client side

---

## 📂 **File Reference**

- **SQL Function:** `supabase_delete_user_function.sql`
- **Client Code:** `src/contexts/AuthContext.tsx` (deleteAccount method)

---

## 🎯 **Summary**

1. ✅ Copy SQL from `supabase_delete_user_function.sql`
2. ✅ Paste into Supabase SQL Editor
3. ✅ Click Run
4. ✅ Test delete account in app

**That's it! Delete account will now work.** 🗑️
