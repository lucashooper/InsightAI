# 🚀 InsightAI Onboarding Flow

## **Official Onboarding Sequence**

The onboarding flow for new users must ALWAYS follow this exact order:

---

## **Step 1: Authentication**
- **Component:** Auth screens (Sign In / Sign Up)
- **File:** `src/components/auth/AuthComponent.tsx`
- **What happens:**
  - User signs in with Google OAuth or email/password
  - Supabase authentication creates user account
  - User is redirected to Step 2

---

## **Step 2: Username Selection**
- **Component:** `UsernameScreen`
- **File:** `src/components/auth/UsernameScreen.tsx`
- **What happens:**
  - User chooses a unique username
  - Profile is created in `user_profiles` table with `user_id`
  - `has_completed_welcome` is set to `false` by default
  - User proceeds to Step 3

**UI Notes:**
- No logo displayed (removed for cleaner look)
- 120 static stars in background
- Subtle hover effect on Continue button (scale: 1.02)

---

## **Step 3: Welcome Screen**
- **Component:** `WelcomeScreen`
- **File:** `src/components/auth/WelcomeScreen.tsx`
- **What happens:**
  - User sees feature overview:
    - AI-powered insights from entries
    - Track patterns and emotional trends
    - Personalized growth recommendations
  - User clicks "Let's Begin"
  - `has_completed_welcome` is set to `true`
  - User proceeds to Step 4

**UI Notes:**
- InsightAI logo centered at top
- Title gradient text (fixed padding to prevent 'g' cutoff)
- Tip text removed (was at bottom)
- Subtle hover on button (scale: 1.02, not 1.05)

---

## **Step 4: Membership Selection** (Optional - if implemented)
- **Component:** `MembershipPage`
- **File:** `src/components/membership/MembershipPage.tsx`
- **What happens:**
  - User selects free or premium tier
  - Subscription details recorded
  - User is redirected to main app

**Note:** Currently may be skipped depending on implementation.

---

## **Step 5: Main App**
- **Component:** `App` 
- **File:** `src/App.tsx`
- **What happens:**
  - User enters main application
  - Empty state shown (no notes)
  - User can create first diary entry

---

## **🔍 How AuthGate Manages Flow**

**File:** `src/components/auth/AuthGate.tsx`

```typescript
// Onboarding logic:
if (!profile) {
  // NEW USER - Show username setup
  setShowUsernameSetup(true);
} else if (!profile.has_completed_welcome) {
  // USERNAME SET - Show welcome screen
  setShowWelcome(true);
} else if (!profile.subscription_tier) {
  // WELCOME DONE - Show membership (if implemented)
  setShowMembership(true);
} else {
  // ONBOARDING COMPLETE - Show main app
  // User sees empty dashboard with "Create your first note" CTA
}
```

---

## **📋 Database State After Each Step**

### **After Step 1 (Auth):**
```
auth.users table:
- id: user_uuid
- email: user@example.com
- created_at: timestamp

user_profiles table:
- (no entry yet)
```

### **After Step 2 (Username):**
```
user_profiles table:
- user_id: user_uuid
- username: "chosen_username"
- email: user@example.com
- has_completed_welcome: false
- subscription_tier: null
- created_at: timestamp
```

### **After Step 3 (Welcome):**
```
user_profiles table:
- user_id: user_uuid
- username: "chosen_username"
- email: user@example.com
- has_completed_welcome: true  ← CHANGED
- subscription_tier: null
- created_at: timestamp
```

### **After Step 4 (Membership):**
```
user_profiles table:
- user_id: user_uuid
- username: "chosen_username"
- email: user@example.com
- has_completed_welcome: true
- subscription_tier: "free" or "premium"  ← CHANGED
- created_at: timestamp
```

---

## **⚠️ Critical Rules**

1. **Order is Sacred:** Never skip steps or change the order
2. **State Checks:** Each step checks database state to determine next screen
3. **Reload After Changes:** After profile updates, reload to re-check state
4. **Empty States:** New users should see empty dashboards (0 notes, 0 playbook items)

---

## **🎨 UI Guidelines for Onboarding**

### **Button Hover Effects:**
- ✅ **Good:** `scale(1.02)` - subtle zoom
- ❌ **Bad:** `scale(1.05)` - too dramatic
- ❌ **Bad:** Full color changes - tacky

### **Logo Display:**
- ✅ UsernameScreen: NO logo
- ✅ WelcomeScreen: YES logo (centered)
- ✅ Main app: Logo in sidebar

### **Text Clipping:**
- Always add `padding-bottom` to gradient text to prevent descender cutoff
- Test with letters: g, j, p, q, y

---

## **🐛 Testing Checklist**

After any onboarding changes, test:

- [ ] New user flow (fresh Google account)
- [ ] Each step appears in correct order
- [ ] Database updates after each step
- [ ] No data from other users appears
- [ ] Empty states show correctly
- [ ] Buttons have subtle hover (not dramatic)
- [ ] No text clipping on any screen
- [ ] Stars are static (no jumping/glitching)

---

## **🔐 Data Isolation**

**CRITICAL:** New users must NEVER see data from other accounts.

Check these areas:
- Notes (filtered by `user_id`)
- Playbook items (must be user-specific)
- Daily protocols (must be user-specific)
- Alerts (must be user-specific)
- Theme settings (localStorage, user-specific)

See `DATA_ISOLATION_FIX.md` for details on fixing localStorage contamination.

---

**Last Updated:** Oct 25, 2025  
**Maintained By:** Development Team
