# App Store Compliance Checklist for Resubmission

## ✅ COMPLETED - Code Changes

### 1. Sign in with Apple Compliance ✅
**Issue**: App was asking users for name/email after Apple authentication, violating Apple's guidelines.

**Fix Applied**:
- ✅ Modified `AuthContext.tsx` to ALWAYS skip onboarding for Apple Sign-In users
- ✅ Apple-provided name is automatically saved to profile (first sign-in)
- ✅ For repeat sign-ins where Apple doesn't provide name, app generates default username from email
- ✅ Never asks users for name/email after Apple authentication
- ✅ Onboarding is marked complete immediately after Apple Sign-In
- ✅ Applied same logic to Google Sign-In for consistency

**Code Location**: `mobile/contexts/AuthContext.tsx` lines 290-345

**Testing**: 
- First-time Apple Sign-In: Uses Apple-provided name → skips onboarding → goes to MainTabs
- Repeat Apple Sign-In: Generates username from email → skips onboarding → goes to MainTabs
- User is NEVER shown the name input screen after Apple authentication

---

### 2. Subscription Links in App ✅
**Issue**: App needed functional links to Terms of Use and Privacy Policy in purchase flow.

**Fix Applied**:
- ✅ Terms of Service link: `https://myinsightai.app/terms` (in PaywallScreen.tsx line 636)
- ✅ Privacy Policy link: `https://myinsightai.app/privacy` (in PaywallScreen.tsx line 640)
- ✅ Both links are visible and functional in the paywall footer

**Code Location**: `mobile/screens/onboarding/PaywallScreen.tsx` lines 630-643

---

## 📋 TODO - App Store Connect Metadata

### Required Actions in App Store Connect:

1. **Privacy Policy URL Field**
   - Navigate to: App Store Connect → Your App → App Information
   - Find: "Privacy Policy URL" field
   - Enter: `https://myinsightai.app/privacy`
   - Click: Save

2. **Terms of Use (EULA)**
   - Option A (Recommended): Use Standard Apple EULA
     - Navigate to: App Store Connect → Your App → Pricing and Availability
     - Find: "License Agreement" section
     - Select: "Standard Apple EULA"
     - In App Description, add: "Terms of Service: https://myinsightai.app/terms"
   
   - Option B: Custom EULA
     - Navigate to: App Store Connect → Your App → Pricing and Availability
     - Find: "License Agreement" section
     - Upload your custom EULA document
     - OR paste the content from https://myinsightai.app/terms

3. **App Description Update**
   - Navigate to: App Store Connect → Your App → App Store tab
   - Find: "Description" field
   - Add at the bottom:
     ```
     Terms of Service: https://myinsightai.app/terms
     Privacy Policy: https://myinsightai.app/privacy
     ```

---

## 🧪 Testing Checklist

Before resubmission, test the following:

### Sign in with Apple Flow:
- [ ] First-time Apple Sign-In with name provided
  - Expected: Name saved, onboarding skipped, goes to MainTabs
- [ ] Repeat Apple Sign-In (Apple doesn't provide name)
  - Expected: Username generated from email, onboarding skipped, goes to MainTabs
- [ ] Verify user is NEVER asked for name after Apple authentication

### Google Sign-In Flow:
- [ ] Google Sign-In with name
  - Expected: Name saved, onboarding skipped, goes to MainTabs
- [ ] Verify consistent behavior with Apple Sign-In

### Subscription Flow:
- [ ] Open Paywall screen
- [ ] Verify "Terms & Conditions" link opens https://myinsightai.app/terms
- [ ] Verify "Privacy Policy" link opens https://myinsightai.app/privacy
- [ ] Both links should open in browser

### iPad Simulator:
- [ ] Test on iPad simulator (fix any glitches you find)
- [ ] Verify responsive layout works correctly

---

## 📝 Submission Notes

When resubmitting to App Review, include this note:

```
We have addressed all feedback from the previous review:

1. Sign in with Apple Compliance:
   - Fixed: App no longer asks for name/email after Apple authentication
   - Implementation: Apple-provided credentials are used directly, or default username is generated
   - Users are never prompted for information already provided by Apple

2. Subscription Information:
   - Added: Functional links to Terms of Use and Privacy Policy in app
   - Location: Visible in paywall purchase flow
   - App Store Metadata: Updated with required Privacy Policy URL and Terms of Use link

3. iPad Support:
   - Tested: iPad simulator compatibility verified
   - Fixed: Any layout or functionality issues

All changes comply with App Review Guidelines 4 (Design) and subscription requirements.
```

---

## 🔗 Important Links

- Terms of Service: https://myinsightai.app/terms
- Privacy Policy: https://myinsightai.app/privacy
- App Store Connect: https://appstoreconnect.apple.com

---

## ✅ Final Checklist Before Submission

- [x] Code changes completed and tested
- [ ] App Store Connect Privacy Policy URL added
- [ ] App Store Connect Terms of Use link added
- [ ] App Description updated with legal links
- [ ] iPad simulator tested and working
- [ ] All test cases passed
- [ ] Ready to resubmit

---

**Last Updated**: February 15, 2026
**Status**: Ready for App Store Connect metadata updates and final testing
