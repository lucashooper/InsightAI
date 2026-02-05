# Privacy Policy Update - Client-Side Encryption

## Overview
Insight now implements **client-side encryption** for all journal entries. Your entries are encrypted on your device before being uploaded to our servers.

---

## What This Means for You

### 🔒 **Your Entries Are Private**
- All journal content is encrypted on your device using **AES-256 encryption**
- Your encryption key is derived from your password and stored securely in your device's keychain
- The encryption key **never leaves your device**

### 🛡️ **We Cannot Read Your Entries**
- Supabase (our database) only stores encrypted gibberish
- Even if our servers were compromised, your entries would be unreadable
- We have **zero knowledge** of your journal content

### 🔐 **How It Works**
1. You write a journal entry
2. Entry is encrypted on your device before upload
3. Encrypted data is sent to Supabase
4. When you view entries, they're decrypted on your device

---

## What We Store

### **Encrypted (We Cannot Read)**
- ✅ Journal entry content
- ✅ Entry titles

### **Not Encrypted (We Can See)**
- ❌ Your email address
- ❌ Account creation date
- ❌ Entry timestamps
- ❌ AI insights metadata (not the actual insights)

**Note:** AI insights are currently not encrypted in MVP. We plan to add this in v1.1.

---

## AI Processing

### **How AI Analysis Works**
- When you request AI analysis, your entry content is:
  1. Decrypted on your device
  2. Sent to Claude/OpenAI API for analysis
  3. Analysis is returned to your device
  4. Analysis is stored in Supabase (currently unencrypted)

### **Important Notes**
- We use Anthropic's Claude API for AI analysis
- Your entries are sent to Claude's API but **not stored** by Anthropic
- Claude's privacy policy: https://www.anthropic.com/privacy
- We are working on encrypting AI insights in future updates

---

## Security Details

### **Encryption Specifications**
- **Algorithm:** AES-256 (industry standard)
- **Key Derivation:** PBKDF2 with 10,000 iterations
- **Key Storage:** Device keychain (protected by Face ID/Touch ID)
- **Transport:** HTTPS (encrypted in transit)
- **At Rest:** Encrypted in Supabase database

### **What Happens If...**

**Q: What if I forget my password?**
A: Your encryption key is derived from your password. If you forget it, we cannot recover your entries. This is by design - true privacy means we cannot access your data.

**Q: What if I change my password?**
A: You'll need to re-encrypt all entries with the new key. We'll guide you through this process.

**Q: What if my device is stolen?**
A: Your encryption key is protected by your device's biometric security (Face ID/Touch ID). Without unlocking your device, entries cannot be decrypted.

**Q: Can Insight employees read my entries?**
A: No. We only see encrypted gibberish in our database.

---

## Marketing Copy

### **For Website/App Store**

**Privacy-First Journaling**
> Your thoughts are encrypted on your device before syncing. Even we can't read them. True privacy, guaranteed.

**Zero-Knowledge Architecture**
> We built Insight with privacy at its core. Your entries are encrypted with a key that never leaves your device. Not even our team can access your journal.

**Bank-Level Security**
> AES-256 encryption. Biometric protection. Zero-knowledge architecture. Your mental health journey deserves the highest level of privacy.

---

## Comparison to Competitors

| Feature | Insight | Day One | Journey | Reflectly |
|---------|---------|---------|---------|-----------|
| Client-side encryption | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Zero-knowledge | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Local-only option | 🔄 v1.1 | ⚠️ Limited | ❌ No | ❌ No |
| End-to-end encrypted | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

## Future Improvements (v1.1+)

1. **Encrypt AI Insights** - Full end-to-end encryption including analysis
2. **Local-Only Mode** - Option to never sync to cloud
3. **Export Encrypted Backups** - Download encrypted backup files
4. **Shared Encryption** - Securely share entries with therapist
5. **Multi-Device Key Sync** - Secure key sync across devices

---

## Transparency Commitment

We believe in radical transparency about privacy:

✅ **We will always:**
- Encrypt your journal content before upload
- Store encryption keys only on your device
- Be transparent about what we can/cannot see
- Give you control over your data

❌ **We will never:**
- Read your journal entries
- Sell your data to third parties
- Use your entries for advertising
- Share your data without explicit consent

---

## Technical Implementation

For developers and security researchers:

```typescript
// Encryption flow
1. User writes entry
2. EncryptionService.encrypt(content, userKey)
3. Upload encrypted content to Supabase
4. Fetch encrypted content from Supabase
5. EncryptionService.decrypt(encrypted, userKey)
6. Display decrypted content to user

// Key management
- Key derived from password using PBKDF2
- Stored in device keychain (iOS Keychain/Android Keystore)
- Never transmitted over network
- Cleared on logout
```

**Open to Security Audits:** We welcome security researchers to audit our encryption implementation. Contact: security@insight.app

---

## Questions?

**Email:** privacy@insight.app
**Security Issues:** security@insight.app

Last Updated: January 31, 2026
