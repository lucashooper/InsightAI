# App Store Submission Requirements Checklist

## Current Rejection Issues (Feb 15, 2026)

### ✅ FIXED: Sign in with Apple (Guideline 4.0 - Design)
**Issue:** App required users to provide name/email after using Sign in with Apple, but this data is already provided by Apple Authentication Services.

**Fix Applied:**
- Modified `AuthContext.tsx` to extract `fullName` from Apple credential
- Automatically save name to user profile when provided by Apple
- Skip name collection in onboarding for Apple Sign-In users
- Mark onboarding as complete when Apple provides name

**Code Location:** `/mobile/contexts/AuthContext.tsx` lines 247-281

---

### ✅ FIXED: Subscription Links (Guideline 3.1.2 - Subscriptions)
**Issue:** Missing functional links to Terms of Use and Privacy Policy in the paywall/purchase flow.

**Fix Applied:**
- Added functional links in `PaywallScreen.tsx` footer
- Terms: `https://insightai.app/terms`
- Privacy: `https://insightai.app/privacy`

**Code Location:** `/mobile/screens/onboarding/PaywallScreen.tsx` lines 636-642

**ACTION REQUIRED:**
- Verify these URLs are live and accessible
- Update URLs if your domain is different
- Add these same links to App Store Connect metadata

---

### ⚠️ TO FIX: In-App Purchase Products (Guideline 2.1 - App Completeness)
**Issue:** In-app purchase products not submitted for review.

**Required Actions:**
1. Go to App Store Connect → Your App → In-App Purchases
2. For each subscription (Weekly, Monthly, Yearly):
   - Add App Review screenshot showing the purchase flow
   - Ensure all metadata is complete:
     - Product name
     - Description
     - Price
     - Subscription duration
     - Review information
3. Submit each in-app purchase for review
4. Wait for approval before resubmitting app binary

**RevenueCat Configuration:**
- Ensure products are configured in RevenueCat dashboard
- Product IDs must match between App Store Connect and RevenueCat
- Current products referenced in code:
  - Weekly: `$4.99/week`
  - Monthly: `$17.99/month`
  - Yearly: `$69.99/year`

---

### ⚠️ TO FIX: iPad Login Bug (Guideline 2.1 - App Completeness)
**Issue:** App returns to login screen after logging in on iPad Air 11-inch (M3).

**Potential Causes:**
1. Navigation state not properly resetting after auth
2. AsyncStorage flags not being set correctly on iPad
3. Auth state listener not triggering navigation update
4. Race condition between auth state and navigation

**Debug Steps:**
1. Test on iPad simulator or device
2. Add extensive logging in `AppNavigator.tsx` auth flow
3. Check `HAS_COMPLETED_ONBOARDING` flag is being set
4. Verify `NavigationContainer` key changes on auth state change
5. Test both Sign in with Apple and email/password on iPad

**Code Locations to Check:**
- `/mobile/navigation/AppNavigator.tsx` - Auth state handling
- `/mobile/contexts/AuthContext.tsx` - Auth state updates
- `/mobile/screens/onboarding/AuthSelectionScreen.tsx` - Post-auth navigation

---

## Complete App Store Requirements Checklist

### 1. Sign in with Apple (If Implemented)
- [ ] Don't ask for name/email if Apple provides it ✅ FIXED
- [ ] Use Apple's provided data from `credential.fullName` and `credential.email`
- [ ] Follow Apple's design guidelines for button placement
- [ ] Test on actual device (not just simulator)

### 2. Auto-Renewable Subscriptions (Guideline 3.1.2)

**In-App Requirements:**
- [ ] Title of subscription (can match IAP product name) ✅ DONE
- [ ] Length of subscription (Weekly, Monthly, Yearly) ✅ DONE
- [ ] Price of subscription ✅ DONE
- [ ] Functional link to Privacy Policy ✅ FIXED
- [ ] Functional link to Terms of Use (EULA) ✅ FIXED

**App Store Connect Metadata:**
- [ ] Privacy Policy URL in Privacy Policy field
- [ ] Terms of Use (EULA) in App Description or EULA field
- [ ] All subscription products submitted for review
- [ ] App Review screenshots for each IAP product

**Current Implementation:**
- PaywallScreen shows all required info ✅
- Links added to footer ✅
- Need to verify URLs are live ⚠️

### 3. In-App Purchases Setup
- [ ] Products created in App Store Connect
- [ ] Products configured in RevenueCat
- [ ] Product IDs match between App Store Connect and RevenueCat
- [ ] Each product has App Review screenshot
- [ ] Test purchase flow in sandbox environment
- [ ] Handle restore purchases ✅ DONE
- [ ] Handle purchase errors gracefully ✅ DONE

### 4. App Completeness
- [ ] App doesn't crash on launch
- [ ] All features work as described
- [ ] No placeholder content or "Lorem ipsum"
- [ ] All buttons/links are functional ✅ FIXED
- [ ] Test on all supported devices (iPhone, iPad)
- [ ] Test on latest iOS version
- [ ] No login loops or navigation bugs ⚠️ TO FIX

### 5. Privacy & Data
- [ ] Privacy Policy accessible and up-to-date
- [ ] Terms of Service accessible and up-to-date
- [ ] Privacy nutrition labels accurate in App Store Connect
- [ ] Data encryption implemented if handling sensitive data ✅ DONE
- [ ] User data deletion process documented

### 6. Design Guidelines (Guideline 4.0)
- [ ] Follow iOS Human Interface Guidelines
- [ ] App works in both portrait and landscape (if supported)
- [ ] Proper Safe Area handling
- [ ] Consistent UI across screens
- [ ] Proper keyboard handling
- [ ] Accessibility features (VoiceOver, Dynamic Type)

### 7. Testing Before Submission
- [ ] Test on physical iPhone device
- [ ] Test on physical iPad device (if supported) ⚠️ FAILED
- [ ] Test Sign in with Apple flow ✅ FIXED
- [ ] Test Google Sign-In flow
- [ ] Test email/password sign up and login
- [ ] Test subscription purchase flow
- [ ] Test restore purchases
- [ ] Test offline functionality
- [ ] Test with poor network conditions
- [ ] Test account deletion/sign out

### 8. App Store Connect Setup
- [ ] App name, subtitle, description complete
- [ ] Screenshots for all required device sizes
- [ ] App icon (1024x1024) uploaded
- [ ] Privacy Policy URL added
- [ ] Support URL added
- [ ] Marketing URL (optional)
- [ ] Age rating completed
- [ ] App category selected
- [ ] Keywords optimized
- [ ] Promotional text (optional)

### 9. App Review Information
- [ ] Demo account credentials provided (if app requires login)
- [ ] Notes to reviewer explaining features
- [ ] Contact information for urgent issues
- [ ] Special instructions for testing subscriptions

### 10. Common Rejection Reasons to Avoid
- [ ] Incomplete app or placeholder content
- [ ] Crashes or major bugs
- [ ] Missing privacy policy or terms
- [ ] Non-functional buttons or features
- [ ] Asking for permissions without explanation
- [ ] Misleading app description or screenshots
- [ ] Copying another app's design/functionality
- [ ] Subscription terms not clearly displayed
- [ ] Sign in with Apple implementation issues ✅ FIXED
- [ ] Missing in-app purchase products ⚠️ TO FIX

---

## Resources

### Official Apple Documentation
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Sign in with Apple Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- [In-App Purchase Guidelines](https://developer.apple.com/app-store/subscriptions/)

### Testing
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)
- [Sandbox Testing for IAP](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)

### RevenueCat
- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [RevenueCat Documentation](https://docs.revenuecat.com/)

---

## Next Steps for Resubmission

1. **Verify URLs are live:**
   - [ ] Test `https://insightai.app/terms`
   - [ ] Test `https://insightai.app/privacy`
   - [ ] Update URLs in code if different

2. **Submit In-App Purchases:**
   - [ ] Add App Review screenshots for each subscription
   - [ ] Submit Weekly subscription for review
   - [ ] Submit Monthly subscription for review
   - [ ] Submit Yearly subscription for review
   - [ ] Wait for IAP approval

3. **Fix iPad Login Bug:**
   - [ ] Reproduce issue on iPad Air 11-inch simulator
   - [ ] Add debug logging to track navigation flow
   - [ ] Test fix on physical iPad if possible
   - [ ] Verify fix doesn't break iPhone flow

4. **Update App Store Connect:**
   - [ ] Add Privacy Policy URL to metadata
   - [ ] Add Terms of Use to App Description or EULA field
   - [ ] Verify all subscription metadata is complete

5. **Final Testing:**
   - [ ] Test complete flow on iPhone
   - [ ] Test complete flow on iPad
   - [ ] Test Sign in with Apple (should NOT ask for name)
   - [ ] Test subscription purchase
   - [ ] Test restore purchases
   - [ ] Verify Terms & Privacy links work

6. **Resubmit:**
   - [ ] Upload new build with fixes
   - [ ] Add detailed notes to reviewer explaining fixes
   - [ ] Submit for review

---

## Demo Account for App Review

**IMPORTANT:** Provide these credentials in App Store Connect → App Review Information

```
Email: demo@insightai.app (or your demo account)
Password: [Your demo password]

Notes for Reviewer:
- This demo account has an active subscription for testing
- Sign in with Apple can be tested with reviewer's own Apple ID
- All subscription features are accessible after purchase
```

---

## Estimated Timeline

- In-App Purchase Review: 24-48 hours
- App Review (after IAP approval): 24-48 hours
- Total: 2-4 days

**Note:** Reviews can take longer during peak times or if additional issues are found.
