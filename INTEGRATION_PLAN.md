# Desktop/Mobile Integration Plan

## Current Status Analysis

### ✅ Completed
1. **Subscription Sync Infrastructure**
   - Desktop `usageTrackingService` now reads `subscription_tier` from Supabase
   - Proper tier mapping: free (0), pro (2), unlimited (999999)
   - Column `subscription_tier` already exists in `user_profiles` table

### 🔴 Critical Gaps

#### 1. **Mobile → Supabase Subscription Sync (CRITICAL)**
**Problem**: Mobile uses RevenueCat but doesn't update Supabase `subscription_tier`
**Impact**: Desktop shows free tier even when user has paid subscription on mobile

**Solution Required**:
- Add RevenueCat listener in mobile `App.tsx` or `AuthContext.tsx`
- When subscription status changes, update Supabase:
```typescript
Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
  const tier = customerInfo.entitlements.active['pro'] ? 'pro' : 'free';
  await supabase.from('user_profiles')
    .update({ subscription_tier: tier })
    .eq('user_id', userId);
});
```

#### 2. **Theme System Mismatch**
**Desktop**: 3 themes (midnight, dusk, light)
**Mobile**: 7 themes (dark, light, vibrant, ocean, forest, sunset, midnight)

**Solution**: Port mobile theme system to desktop
- Copy `mobile/contexts/ThemeContext.tsx` → `src/contexts/ThemeContext.tsx`
- Update `src/components/settings/SettingsView.tsx` to show all 7 themes
- Add theme CSS variables for each theme in `src/styles/themes.css`

#### 3. **Container Styling Inconsistency**
**Desktop**: Gray boxes `rgba(255, 255, 255, 0.03-0.05)`
**Mobile**: Black boxes with subtle purple tint `rgba(10, 10, 10, 0.95)`

**Solution**: Update desktop to match mobile
- Settings cards: Change from gray to black
- Dashboard cards: Use mobile's `cardBackground` colors
- Consistent border colors: `rgba(255, 255, 255, 0.08)`

### 📋 Feature Parity Checklist

| Feature | Mobile | Desktop | Action Needed |
|---------|--------|---------|---------------|
| Themes | 7 themes | 3 themes | ✅ Port mobile themes |
| Subscription Display | Pro/Free | Pro/Free | ✅ Fixed sync |
| Container Style | Black | Gray | ✅ Unify to black |
| Theme Switcher UI | Grid with previews | Simple list | ✅ Match mobile UI |
| RevenueCat Integration | ✅ | ❌ | ⚠️ Desktop doesn't need it |
| Supabase Sync | ❌ Missing | ✅ | 🔴 Add to mobile |

### 🎨 Design System Unification

#### Colors (Mobile Standard)
```typescript
background: '#000000'
cardBackground: 'rgba(10, 10, 10, 0.95)'
surface: 'rgba(139, 92, 246, 0.08)'
border: 'rgba(255, 255, 255, 0.08)'
```

#### Typography
- Mobile uses consistent spacing and weights
- Desktop should match mobile's font hierarchy

### 🚀 Implementation Priority

1. **HIGH**: Add RevenueCat → Supabase sync in mobile
2. **HIGH**: Unify container styling (gray → black)
3. **MEDIUM**: Port 7-theme system to desktop
4. **MEDIUM**: Update theme switcher UI to match mobile
5. **LOW**: Audit other UI inconsistencies

### 📝 Next Steps

1. Locate mobile RevenueCat initialization
2. Add subscription update listener
3. Test subscription sync flow
4. Update desktop container colors
5. Port theme system
6. Visual QA pass on both platforms

## SQL Already Exists
The `subscription_tier` column already exists in `user_profiles` table. No SQL migration needed.
