# 🔒 Data Isolation Fix - Critical Security Issue

## **🚨 THE PROBLEM**

When the user "Jasper" (new account) logged in, they saw playbook recommendations from the "jonny edwards" account. This is a **CRITICAL data contamination issue**.

---

## **🔍 Root Cause**

### **localStorage Keys Are Not User-Specific**

The following services store data in `localStorage` with **static keys** that are shared across ALL users:

```typescript
// ❌ BAD - Shared across all users
const STORAGE_KEY_INSIGHTS = 'insightai_actionable_insights';
const STORAGE_KEY_PROGRESS = 'insightai_insight_progress';
const STORAGE_KEY_PROTOCOLS = 'insightai_daily_protocols';
const STORAGE_KEY_COMPLETIONS = 'insightai_daily_completions';
```

**What this means:**
- User A logs in → Saves playbook data to `insightai_actionable_insights`
- User B logs in → Sees User A's playbook data!
- **NO data isolation whatsoever**

---

## **📋 Affected Files**

| File | Service | Keys | Issue |
|------|---------|------|-------|
| `actionableInsightsService.ts` | Playbook | `insightai_actionable_insights`<br>`insightai_insight_progress` | Not user-specific |
| `dailyProtocolService.ts` | Daily Protocols | `insightai_daily_protocols`<br>`insightai_daily_completions` | Not user-specific |
| `ThemeContext.tsx` | Theme | `insightai-theme` | Actually OK (theme can be shared) |
| `SettingsView.tsx` | Settings | `insightai-reminders-enabled`<br>`insightai-reminder-time` | Not user-specific |

---

## **✅ THE SOLUTION**

### **Make localStorage Keys User-Specific**

**Pattern:**
```typescript
// ✅ GOOD - User-specific key
const getStorageKey = (key: string, userId: string) => {
  return `insightai_${userId}_${key}`;
};

// Example:
// User A: insightai_abc123_actionable_insights
// User B: insightai_xyz789_actionable_insights
```

---

## **🛠️ Implementation Steps**

### **Step 1: Update `actionableInsightsService.ts`**

```typescript
import { supabase } from './supabaseClient';

class ActionableInsightsService {
  // Helper to get user-specific storage key
  private async getStorageKey(key: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    return `insightai_${user.id}_${key}`;
  }

  async getInsights(): ActionableInsight[] {
    try {
      const key = await this.getStorageKey('actionable_insights');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading actionable insights:', error);
      return [];
    }
  }

  async saveInsight(insight: Omit<ActionableInsight, 'id' | 'createdAt'>): Promise<ActionableInsight> {
    const insights = await this.getInsights();
    const newInsight: ActionableInsight = {
      ...insight,
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    insights.push(newInsight);
    const key = await this.getStorageKey('actionable_insights');
    localStorage.setItem(key, JSON.stringify(insights));
    return newInsight;
  }

  // Similar changes for all other methods...
}
```

### **Step 2: Update `dailyProtocolService.ts`**

Same pattern - add `getStorageKey` helper and make all keys user-specific.

### **Step 3: Update `SettingsView.tsx`**

```typescript
// Get user-specific settings keys
const { data: { user } } = await supabase.auth.getUser();
const remindersKey = `insightai_${user?.id}_reminders_enabled`;
const timeKey = `insightai_${user?.id}_reminder_time`;

localStorage.getItem(remindersKey);
localStorage.setItem(remindersKey, value);
```

---

## **🧪 Testing the Fix**

### **Test Case 1: Fresh Account**
1. Create new account "TestUser1"
2. Add playbook item "Strategy A"
3. Log out
4. Create new account "TestUser2"
5. Check playbook
   - ✅ **Expected:** Empty (0 items)
   - ❌ **Bug:** Shows "Strategy A"

### **Test Case 2: Account Switching**
1. Log in as "User A"
2. Add playbook item "User A Strategy"
3. Log out
4. Log in as "User B"
5. Add playbook item "User B Strategy"
6. Log out
7. Log in as "User A" again
8. Check playbook
   - ✅ **Expected:** Only "User A Strategy"
   - ❌ **Bug:** Shows both strategies

### **Test Case 3: Data Persistence**
1. Log in as "User A"
2. Add playbook item
3. Refresh page
4. Check playbook
   - ✅ **Expected:** Item still there
   - ❌ **Bug:** Item disappeared

---

## **🔐 Security Best Practices**

### **1. Always Include user_id**
```typescript
// ✅ GOOD
localStorage.setItem(`insightai_${userId}_data`, value);

// ❌ BAD
localStorage.setItem('insightai_data', value);
```

### **2. Clear on Logout**
```typescript
// Clear user-specific data on logout
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(`insightai_${user.id}_`)) {
      localStorage.removeItem(key);
    }
  });
}
```

### **3. Clear on Account Switch**
Already implemented in `AuthContext.tsx`:
```typescript
const storedUserId = localStorage.getItem('insight_ai_current_user');
if (storedUserId && storedUserId !== session.user.id) {
  // Clear old user's data
  clearLocalStorage();
}
```

---

## **⚠️ Migration Concerns**

### **Existing Users Will Lose Data**

When you deploy this fix, existing users will have data under old keys:
- Old: `insightai_actionable_insights`
- New: `insightai_abc123_actionable_insights`

**Migration Script:**
```typescript
// Run this ONCE per user on first login after update
async function migrateUserData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if migration already done
  const migrationKey = `insightai_${user.id}_migrated`;
  if (localStorage.getItem(migrationKey)) return;

  // Migrate old data to new keys
  const oldInsights = localStorage.getItem('insightai_actionable_insights');
  if (oldInsights) {
    const newKey = `insightai_${user.id}_actionable_insights`;
    localStorage.setItem(newKey, oldInsights);
    localStorage.removeItem('insightai_actionable_insights');
  }

  // Similar for other keys...

  // Mark migration as complete
  localStorage.setItem(migrationKey, 'true');
}
```

---

## **📊 Impact Assessment**

| Area | Status | Action Required |
|------|--------|-----------------|
| **Notes** | ✅ Safe | Already filtered by `user_id` in database |
| **Playbook** | ❌ **CRITICAL** | Fix `actionableInsightsService.ts` |
| **Daily Protocols** | ❌ **CRITICAL** | Fix `dailyProtocolService.ts` |
| **Settings** | ⚠️ Minor | Fix reminder settings |
| **Theme** | ✅ OK | Theme can be shared across users |
| **Auth State** | ✅ Safe | Supabase handles this |

---

## **🚀 Deployment Plan**

1. **Fix services** (make keys user-specific)
2. **Add migration script** (preserve existing data)
3. **Test thoroughly** (all 3 test cases above)
4. **Deploy to production**
5. **Monitor** for data isolation issues

---

## **📝 Checklist Before Deploy**

- [ ] All localStorage keys are user-specific
- [ ] Migration script tested
- [ ] New accounts see empty states
- [ ] Account switching works correctly
- [ ] Existing users don't lose data
- [ ] No errors in console
- [ ] All test cases pass

---

**Status:** 🔴 **CRITICAL - NEEDS IMMEDIATE FIX**  
**Priority:** P0 - Security/Privacy Issue  
**Assigned:** Development Team  
**Last Updated:** Oct 25, 2025
