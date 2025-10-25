# 🔐 Stripe Integration Setup - CRITICAL

## ⚠️ YOU MUST HAVE YOUR SECRET KEY

**You CANNOT complete Stripe checkout without your secret key.** The publishable key is only for frontend elements. The checkout session creation MUST happen server-side with your secret key for security.

---

## 📋 What You Need

### From Your Stripe Dashboard:

1. **Secret Key** (starts with `sk_live_...`) - **REQUIRED**
2. **Publishable Key** (starts with `pk_live_...`) - ✅ You have this
3. **Price ID** (starts with `price_...`) - **REQUIRED**

---

## 🔍 How to Get Your Price ID

1. Go to **Stripe Dashboard** → **Products**
2. Click on your **£5/month** product
3. Click on the **price** in the pricing table
4. Copy the **Price ID** (looks like: `price_1234567890abcdef`)

You gave me the **Product ID** (`prod_THQ4cDclsWjhbx`), but I need the **Price ID** associated with it.

---

## 🔧 Setup Instructions

### Step 1: Add Stripe Package

```bash
npm install stripe @stripe/stripe-js @netlify/functions
npm install -D @types/node
```

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SKqiFAN91Um40UbTf4NJZr1I2F5GfQpaJ8ZnNWZYvanH65sN3JA7BTYv1Ftu5ShJ96RgCAqW1nPa5PMns0cxlra00A0zKqK0o
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
VITE_STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
```

### Step 3: Add to Netlify Environment Variables

In **Netlify Dashboard** → **Site settings** → **Environment variables**:

```
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51SKqiFAN91Um40UbTf4NJZr1I2F5GfQpaJ8ZnNWZYvanH65sN3JA7BTYv1Ftu5ShJ96RgCAqW1nPa5PMns0cxlra00A0zKqK0o
VITE_STRIPE_PRICE_ID=price_...
```

⚠️ **NEVER commit your secret key to Git!** It should only be in:
- Local `.env.local` (gitignored)
- Netlify environment variables

---

## 📁 Files Created

### 1. **Netlify Function** (Server-side)
`netlify/functions/create-checkout-session.ts`

This creates the Stripe checkout session with:
- ✅ 3-day free trial
- ✅ £5/month subscription
- ✅ Cancel anytime
- ✅ Secure server-side processing

### 2. **Membership Page** (Frontend)
`src/components/membership/MembershipPage.tsx`

Beautiful premium membership page with:
- ✅ Feature list
- ✅ Trial badge
- ✅ Secure payment indicators
- ✅ Skip option for later

### 3. **Styles**
`src/components/membership/membership.css`

Premium dark design with starfield background matching your auth pages.

---

## 🚀 How It Works

### Flow:
1. User clicks **"Start Free Trial"**
2. Frontend calls Netlify Function
3. Netlify Function creates Stripe Checkout Session (with trial)
4. User redirected to Stripe Checkout
5. After payment, user redirected back to your app
6. Stripe handles the trial and billing automatically

### Trial Behavior:
- **Day 1-3:** User has full access, **no charge**
- **Day 4:** Stripe automatically charges £5
- **Every month after:** £5 charge
- User can cancel anytime before Day 4 to avoid charge

---

## 🔄 Integration with Auth Flow

You need to decide WHEN to show the membership page:

### Option A: After Signup (Recommended)
```tsx
// In Signup.tsx after successful registration
if (signupSuccess) {
  // Show membership page instead of immediate redirect
  setShowMembershipPage(true);
}
```

### Option B: Separate Onboarding Step
Create an onboarding flow:
1. Signup
2. Email Verification
3. Membership (can skip)
4. Dashboard

---

## 📝 Next Steps

### 1. Get Your Price ID
- Go to Stripe Dashboard
- Find your £5/month product
- Copy the **Price ID**

### 2. Get Your Secret Key
- Stripe Dashboard → **Developers** → **API Keys**
- **Reveal** and copy **Secret key**

### 3. Update the Code
Replace in `create-checkout-session.ts`:
```typescript
const PRICE_ID = process.env.VITE_STRIPE_PRICE_ID || 'price_YOUR_ACTUAL_PRICE_ID';
```

Replace in `MembershipPage.tsx`:
```typescript
priceId: process.env.VITE_STRIPE_PRICE_ID || 'price_YOUR_ACTUAL_PRICE_ID',
```

### 4. Test Locally
```bash
netlify dev
```

Then visit: `http://localhost:8888/membership`

### 5. Deploy to Netlify
```bash
git add .
git commit -m "Add Stripe membership integration"
git push
```

Make sure environment variables are set in Netlify!

---

## 🐛 Troubleshooting

### Error: "No API key provided"
- Make sure `STRIPE_SECRET_KEY` is in Netlify environment variables
- Redeploy after adding env vars

### Error: "Invalid price ID"
- Double-check your Price ID in Stripe Dashboard
- Make sure it starts with `price_` not `prod_`

### Checkout not redirecting back
- Check your success/cancel URLs in the Netlify function
- Make sure they match your domain

### Trial not working
- Check `subscription_data.trial_period_days` is set to `3`
- Verify in Stripe Dashboard after test purchase

---

## 🎯 Test Mode

For testing, you can use Stripe Test Keys:
- Test Secret Key: `sk_test_...`
- Test Publishable Key: `pk_test_...`
- Test Card: `4242 4242 4242 4242` (any future date, any CVC)

---

## 💳 Live Mode Checklist

Before going live:
- [ ] Switch from test keys to live keys
- [ ] Test a real subscription with your own card
- [ ] Verify trial works correctly
- [ ] Set up webhook for subscription events (optional but recommended)
- [ ] Configure email receipts in Stripe Dashboard

---

## 🔗 Useful Stripe Dashboard Links

- **API Keys:** https://dashboard.stripe.com/apikeys
- **Products:** https://dashboard.stripe.com/products
- **Customers:** https://dashboard.stripe.com/customers
- **Subscriptions:** https://dashboard.stripe.com/subscriptions

---

## 📧 Need Help?

If you encounter issues:
1. Check Netlify Function logs
2. Check browser console
3. Check Stripe Dashboard logs
4. Check that all environment variables are set correctly

**Remember: You MUST have your secret key for this to work!**
