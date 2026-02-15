# Desktop Web App Strategy

## Current Status
The desktop web app is now unified with the marketing site in a single React codebase. All routes (/, /terms, /privacy, /support, /login, /app/*) are handled by React Router.

## Critical Issues to Address

### 1. Subscription Plans - NEEDS IMMEDIATE FIX
**Problem:** Desktop shows 2 plans (Free + £5 Premium), but mobile shows 3 plans with different pricing:
- Mobile: Weekly ($4.99), Monthly ($17.99), Yearly ($69.99)
- Desktop: Free ($0), Premium (£5/month)

**Inconsistencies:**
- "Unlimited AI analyses" claim on desktop is incorrect
- Pricing doesn't match mobile
- Feature lists don't align

**Recommended Solution:**
Update desktop to match mobile exactly:
- Remove "Free Plan" (or make it clear it's limited trial)
- Show same 3 subscription tiers as mobile
- Match exact feature lists and pricing
- Use same currency (USD) for consistency

### 2. Encryption Strategy

**Mobile App:**
- Uses device-level encryption
- Data encrypted before sending to Supabase
- Encryption keys stored securely on device

**Desktop Web App Options:**

**Option A: Web Crypto API (Recommended)**
- Use browser's Web Crypto API for encryption
- Store encryption key in IndexedDB (encrypted with user password)
- Encrypt data client-side before sending to Supabase
- Same security model as mobile

**Option B: Server-Side Encryption**
- Encrypt on server using user-specific keys
- Less secure than client-side
- Easier to implement

**Option C: No Desktop Encryption**
- Mark desktop as "less secure" option
- Encourage users to use mobile for sensitive entries
- Not recommended for privacy-focused app

**Recommendation:** Implement Option A (Web Crypto API) to maintain consistency with mobile's security promise.

### 3. Subscription Management Strategy

**Problem:** How to handle users who subscribe on mobile vs web?

**Option A: Mobile-Only Subscriptions (Recommended)**
- Disable in-app purchases on web entirely
- Add "Already subscribed on mobile?" login flow
- Check subscription status via Supabase after login
- Web app reads subscription status but doesn't sell subscriptions
- Avoids Apple/Google 30% fee conflicts
- Simpler to manage

**Option B: Web Subscriptions via Stripe**
- Offer web subscriptions through Stripe
- Separate from mobile subscriptions
- Users choose where to subscribe
- More complex: need to sync subscription status across platforms
- Potential for confusion if user subscribes twice

**Option C: Universal Subscriptions**
- Use RevenueCat's web SDK
- Single subscription works across all platforms
- Most user-friendly but most complex to implement
- Requires RevenueCat web integration

**Recommendation:** Option A (Mobile-Only) for now, can add Option C later if needed.

### 4. Implementation Plan

#### Phase 1: Fix Subscription Plans (Immediate)
1. Update desktop pricing component to match mobile exactly
2. Remove misleading "Unlimited AI analyses" claim
3. Match feature lists 1:1 with mobile
4. Use consistent currency (USD)

#### Phase 2: Implement Web Encryption (Week 1)
1. Add Web Crypto API encryption service
2. Encrypt journal entries before saving to Supabase
3. Decrypt on retrieval
4. Store encryption key securely in IndexedDB
5. Test thoroughly

#### Phase 3: Subscription Flow (Week 1-2)
1. Remove purchase buttons from web app
2. Add "Subscribe on mobile" messaging
3. Implement subscription status check on login
4. Show appropriate UI based on subscription status
5. Add "Already purchased?" help section

#### Phase 4: Feature Parity (Week 2-3)
1. Ensure all mobile features work on web
2. Test encryption across devices
3. Verify data syncs correctly
4. Add export functionality
5. Test edge cases

## Files to Update

### Subscription Plans
- `/src/components/subscription/PricingCard.tsx` or similar
- Update to match mobile plans exactly

### Encryption
- Create `/src/services/encryption.ts`
- Implement Web Crypto API
- Update journal entry save/load logic

### Subscription Management
- Update `/src/components/subscription/` components
- Add subscription status checks
- Remove purchase flows (or redirect to mobile)

## Security Considerations

1. **Encryption Keys:** Never send encryption keys to server
2. **Password Storage:** Use proper hashing (bcrypt/argon2)
3. **HTTPS Only:** Enforce HTTPS in production
4. **XSS Protection:** Sanitize all user input
5. **CSRF Protection:** Implement CSRF tokens for sensitive actions

## User Experience

### For New Users
1. Sign up on web or mobile
2. If on web, prompted to download mobile app for subscriptions
3. Can use free tier on web
4. Full features after subscribing on mobile

### For Existing Mobile Users
1. Login on web with same credentials
2. Subscription status automatically detected
3. Full access to premium features
4. Data syncs seamlessly

### For Existing Web Users (if any)
1. Prompted to subscribe via mobile app
2. Or wait for web subscriptions (Phase 2)
3. Can continue using free tier

## Next Steps

1. **Immediate:** Fix subscription plan display on desktop
2. **This Week:** Implement Web Crypto API encryption
3. **Next Week:** Update subscription flow
4. **Ongoing:** Monitor user feedback and iterate

## Questions to Resolve

1. Do we want to support web subscriptions eventually?
2. What's the free tier limit? (1 AI analysis per day?)
3. Should we add "Download mobile app" CTAs on web?
4. Do we need a separate web onboarding flow?
