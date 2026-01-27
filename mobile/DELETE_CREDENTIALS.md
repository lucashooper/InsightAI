# How to Fix the Provisioning Profile Issue

The build is failing because EAS is using a cached provisioning profile that includes Apple Sign-In capability, but we've removed the Apple Authentication plugin.

## Solution: Delete EAS Credentials

Run this command and follow the prompts:

```bash
eas credentials
```

Then:
1. Select **iOS**
2. Select **production** profile
3. Choose **Provisioning Profile**
4. Select **Remove Provisioning Profile**
5. Confirm deletion

After deleting, run the build again:

```bash
eas build --platform ios --non-interactive
```

EAS will automatically generate a NEW provisioning profile without Apple Sign-In capability.

## Alternative: Use a Different Bundle Identifier

If the above doesn't work, we can temporarily change the bundle identifier in `app.json` to force EAS to create completely fresh credentials:

```json
"ios": {
  "bundleIdentifier": "com.crupid.mobile.temp"
}
```

Then change it back after the build succeeds.
