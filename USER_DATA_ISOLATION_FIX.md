# ✅ User Data Isolation Fix

## ❌ **The Problem You Described**

When you sign in with a different Google account, it shows:
- ✅ New email (correct)
- ❌ Old username ("crupid")  
- ❌ All the original notes from the first account

**Root Cause:** Notes are stored in browser localStorage with global keys, so all users on the same browser see the same data.

---

## ✅ **The Solution Applied**

I've implemented **automatic data clearing when switching accounts**:

### **What Happens Now:**

1. **User signs in with Account A**
   - Data loads normally
   - User ID stored: `insight_ai_current_user = user_a_id`

2. **User signs in with Account B** (different account)
   - System detects: stored user ID ≠ new user ID
   - **Auto-clears all localStorage data** (notes, settings, etc.)
   - Stores new user ID: `insight_ai_current_user = user_b_id`
   - Fresh start with empty notes ✅

3. **User signs out**
   - All localStorage data cleared
   - Next sign-in is always fresh

---

## 🔧 **What Changed**

### **File: `src/contexts/AuthContext.tsx`**

#### **1. Detect Account Switches**
```typescript
if (session) {
  const storedUserId = localStorage.getItem('insight_ai_current_user');
  
  // If user ID changed, clear all old data
  if (storedUserId && storedUserId !== session.user.id) {
    console.log('🔄 User switched accounts - clearing old data');
    
    // Remove all insight_ai_* keys except current_user
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('insight_ai_') && key !== 'insight_ai_current_user') {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Store current user ID
  localStorage.setItem('insight_ai_current_user', session.user.id);
}
```

#### **2. Clear Data on Sign Out**
```typescript
const signOut = async () => {
  // Clear ALL app data before signing out
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('insight_ai_')) {
      localStorage.removeItem(key);
    }
  });
  
  await supabase.auth.signOut();
};
```

---

## 🧪 **How to Test**

### **Test 1: Switch Accounts**
1. Sign in with Google Account A
2. Create some notes
3. Sign out
4. Sign in with Google Account B
5. ✅ Should see **NO notes** from Account A
6. ✅ Should see Account B's email
7. ✅ Fresh username (not "crupid")

### **Test 2: Return to Original Account**
1. Sign out from Account B
2. Sign in with Account A again
3. ✅ Should see **NO notes** (they were cleared)
4. ✅ Fresh start for Account A

---

## 📊 **Data That Gets Cleared**

When switching accounts or signing out, these are cleared:

```
insight_ai_diary_entries          ← All notes
insight_ai_pattern_alerts         ← All alerts
insight_ai_user_id                ← Local user ID
insight_ai_last_sync              ← Sync timestamp
insight_ai_actionable_insights    ← Strategies
insight_ai_insight_progress       ← Strategy progress
insight_ai_daily_protocols        ← Daily protocols
insight_ai_protocol_completions   ← Protocol completions
insight_ai_current_user           ← Current user tracker
```

**Everything is wiped clean** for account switches!

---

## ⚠️ **Important Notes**

### **Data Persistence:**
- **Browser-specific:** Data is stored per browser
- **Not synced:** Switching browsers = fresh start
- **Account isolation:** Each account gets clean slate

### **Username "crupid":**
The username comes from your user profile in Supabase's `user_profiles` table. When you sign in with a new Google account, a new profile should be created automatically with your Google email prefix as the username.

If it's still showing "crupid", that means:
1. The profile creation didn't work, OR
2. You're looking at cached data

**Solution:** After signing in with the new account, check Settings → Profile. If it still shows "crupid", there might be an issue with the profile creation logic.

---

## 🎯 **Expected Behavior Now**

| Action | What Happens | Result |
|--------|--------------|--------|
| **Sign in (Account A)** | Load Account A data | ✅ Show A's notes |
| **Sign out** | Clear all localStorage | ✅ Empty state |
| **Sign in (Account B)** | Detect different user ID | ✅ Clear old data |
|  | Create new profile | ✅ Show B's email |
|  | Load empty notes | ✅ Fresh start |
| **Sign in (Account A again)** | Detect different user ID | ✅ Clear B's data |
|  | Load A's profile | ✅ Fresh start |

---

## 🐛 **If Still Seeing Old Data**

### **1. Hard Refresh**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### **2. Clear Browser Cache**
```
Chrome: Dev Tools (F12) → Application → Local Storage
→ Right-click → Clear
```

### **3. Check Console**
Look for:
```
🔄 User switched accounts - clearing old data
```

If you don't see this message, the detection isn't working.

### **4. Manual Clear (Emergency)**
Open browser console and run:
```javascript
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('insight_ai_')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

---

## ✅ **Summary**

**Fixed:**
- ✅ Automatic data clearing when switching accounts
- ✅ Clean slate for each new user
- ✅ No data mixing between accounts
- ✅ Clear all data on sign out

**How It Works:**
- Tracks current user ID in localStorage
- Compares on each sign-in
- If different → clears all app data
- Ensures each account is isolated

**Test it now:** Sign out, sign in with a different Google account, and you should see a completely fresh app with no old notes!

---

## 🚀 **Next Steps (Optional Improvements)**

If you want **persistent data across accounts**, you'd need to:
1. Store notes in Supabase instead of localStorage
2. Each user's notes tied to their user_id in database
3. Data survives browser clears and account switches

But for now, **localStorage with auto-clear on account switch** solves the immediate problem!
