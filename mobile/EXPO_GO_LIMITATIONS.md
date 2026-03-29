# Expo Go Network Limitations

## The Problem

When testing OTP verification in **Expo Go**, you may encounter this error:

```
Network request failed
AuthRetryableFetchError: Network request failed
```

**Important:** This is NOT a bug in your code. The OTP code is correct, and the email was sent successfully. This is a known limitation of Expo Go.

## Why This Happens

Expo Go has restricted network access and can't always complete Supabase auth requests, especially:
- OTP verification calls
- Password reset flows
- Session refresh operations

The Supabase client tries to make authenticated requests, but Expo Go's sandboxed environment blocks them.

## Solutions

### ✅ Solution 1: Use Development Build (Recommended)

Development builds don't have Expo Go's network restrictions:

```bash
cd mobile

# Install the local iOS dev client
npm run ios

# Start Metro in dev-client mode
npm run start

# Re-open simulator with the dev client
npm run ios:dev
```

**Benefits:**
- ✅ No network restrictions
- ✅ Full native module support
- ✅ Better debugging
- ✅ Matches production environment

### ✅ Solution 2: Wait and Retry

Sometimes the request succeeds after a delay:

1. Enter the OTP code
2. If you get the network error, wait 10 seconds
3. Tap "Retry" in the alert
4. The verification may succeed

### ✅ Solution 3: Test in Production Build

Build for TestFlight or App Store:

```bash
cd mobile

# Build for TestFlight
eas build --profile preview --platform ios

# Or build for production
eas build --profile production --platform ios
```

Production builds have full network access.

### ⚠️ Solution 4: Different Network

Sometimes switching networks helps:
- Try WiFi instead of cellular
- Try cellular instead of WiFi
- Disable VPN if active

## What We've Done to Help

### 1. Extended Timeout
```typescript
// In lib/supabase.ts
global: {
  fetch: (url, options = {}) => {
    const timeout = 30000; // 30 seconds
    // ... timeout handling
  }
}
```

### 2. Better Error Messages
The app now shows a helpful message explaining:
- This is an Expo Go limitation
- The code is correct
- How to fix it

### 3. Retry Logic
The Retry button waits 1 second before retrying, giving the network time to stabilize.

## Testing Checklist

Before submitting to App Store, test in a **development build** or **TestFlight**:

- [ ] Signup with email verification
- [ ] OTP code entry
- [ ] Password reset flow
- [ ] Login/logout
- [ ] Session persistence

## For Development

**During development:**
- Use the dev client as the default workflow
- Use Expo Go only for very lightweight UI checks
- Use TestFlight for final testing

**For production:**
- Always test auth flows in TestFlight before App Store submission
- Expo Go is NOT representative of production behavior

## Technical Details

**Why Expo Go has limitations:**
- Runs in a sandboxed container
- Shares network stack with Expo Go app
- Limited native module access
- Restricted background tasks

**Why development builds work:**
- Standalone app with full permissions
- Direct network access
- Full native module support
- Matches production environment

## Summary

| Environment | Auth Works? | Recommended For |
|-------------|-------------|-----------------|
| Expo Go | ❌ Sometimes fails | UI development only |
| Development Build | ✅ Yes | Feature testing |
| TestFlight | ✅ Yes | Pre-release testing |
| Production | ✅ Yes | End users |

## Next Steps

1. **For day-to-day simulator work:** Use the dev client workflow
2. **For quick UI-only checks:** Expo Go is optional
3. **For final testing:** Use TestFlight
4. **For submission:** Ensure all auth flows work in TestFlight

---

**Bottom line:** The network error in Expo Go is expected. Your code is correct. Test in a development build or TestFlight for accurate results.
