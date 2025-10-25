# 🔧 Delete Account SQL Error Fix

## ❌ **The Error**

```
Failed to delete account: missing FROM-clause entry for table "delete_user"
```

## 🐛 **The Problem**

The SQL function had a naming conflict. It used `delete_user.user_id` which PostgreSQL interpreted as a table name instead of a variable.

**Broken code:**
```sql
DELETE FROM user_profiles WHERE user_profiles.user_id = delete_user.user_id;
                                                         ↑ This caused the error!
```

---

## ✅ **The Fix**

Run this **corrected SQL** in Supabase SQL Editor:

```sql
-- Drop the old broken function
DROP FUNCTION IF EXISTS delete_user();

-- Create the corrected function
CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;  -- Changed variable name to avoid conflict
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Now uses current_user_id instead of delete_user.user_id
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  
  BEGIN
    DELETE FROM diary_entries WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
  
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RETURN json_build_object('success', true, 'message', 'Account deleted successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
```

---

## 🎯 **Quick Fix Steps**

1. Open **Supabase SQL Editor**
2. Copy the SQL above
3. Click **Run**
4. Try delete account again
5. ✅ Should work now!

---

## 📝 **What Changed**

| Before | After | Why |
|--------|-------|-----|
| `delete_user.user_id` | `current_user_id` | Avoid name conflict |
| Function variable name matched function name | Different variable name | PostgreSQL got confused |

---

**The fixed SQL is in `supabase_delete_user_function_FIXED.sql`** ✅
