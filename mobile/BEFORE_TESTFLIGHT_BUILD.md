# ⚠️ BEFORE BUILDING FOR TESTFLIGHT

Social auth has been temporarily disabled for Expo Go simulator testing.

## Required Changes Before Production Build:

### 1. Restore AuthContext.tsx imports (line 5-8):
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
```

### 2. Uncomment Google Sign-In configuration (line 28-34)

### 3. Restore full social auth methods:
- `signInWithGoogle()` - uncomment production code
- `signInWithApple()` - uncomment production code  
- `signOut()` - add back GoogleSignin.signOut()

### 4. Restore DashboardScreenNew.tsx:
- Uncomment speech recognition import (line 20)
- Uncomment startRecording/stopRecording methods
- Uncomment permissions check

---

**Quick command to check:**
```bash
grep -n "Disabled for Expo Go" contexts/AuthContext.tsx
```

If this returns results, social auth is still disabled.
