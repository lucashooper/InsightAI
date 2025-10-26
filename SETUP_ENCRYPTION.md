# 🚀 Setting Up E2E Encryption - Quick Guide

## Step 1: Run Database Migration

You need to add the new columns to your Supabase database:

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add encryption fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS encryption_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_salt TEXT,
ADD COLUMN IF NOT EXISTS encryption_test_payload TEXT;

-- Add encrypted_content column to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS encrypted_content TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_encrypted_content 
ON notes(user_id) WHERE encrypted_content IS NOT NULL;
```

5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Verify it worked: Check **Table Editor** → `user_profiles` and `notes` tables

---

## Step 2: Test the Flow

### A. New User Signup Flow

1. **Sign up** with a new account (use test email)
2. **Setup Encryption Modal** should appear automatically
3. Follow the setup:
   - Read intro screen → Click "Setup Encryption"
   - Create password (min 8 chars) → Click "Continue"
   - **IMPORTANT**: Copy the recovery key → Check the warning box → Click "Complete Setup"
4. App should load normally
5. **Create a note** → Should be encrypted automatically
6. **Check database**:
   ```sql
   SELECT title, content, encrypted_content 
   FROM notes 
   WHERE user_id = 'your-user-id';
   ```
   - `title` should be `[Encrypted]`
   - `content` should be `[Encrypted content]`
   - `encrypted_content` should have JSON blob

### B. Returning User Flow

1. **Log out**
2. **Log back in**
3. **Unlock Vault Modal** should appear
4. Enter your encryption password
5. Notes should decrypt and display normally

### C. AI Analysis with Encryption

1. Create or edit a note
2. Click "Generate Insights"
3. AI should analyze successfully (decrypts temporarily)
4. Insights should be encrypted with note
5. Check database - insights should be in `encrypted_content`

---

## Step 3: Verify Security

### Test 1: Server Can't Read Notes

```sql
-- View raw encrypted data
SELECT 
  id,
  title,
  content,
  encrypted_content,
  user_id
FROM notes
WHERE user_id = 'test-user-id';

-- You should see:
-- title: "[Encrypted]"
-- content: "[Encrypted content]"  
-- encrypted_content: "{\"ciphertext\":\"...\",\"iv\":\"...\",\"salt\":\"...\"}"
```

✅ **Expected**: All sensitive data is encrypted gibberish

### Test 2: Wrong Password Fails

1. Log out
2. Log in
3. Enter **wrong password** in unlock modal
4. Should show error: "Incorrect password"
5. Notes should NOT load

✅ **Expected**: Authentication fails gracefully

### Test 3: Cross-User Isolation

1. Create notes with User A (encrypted)
2. Log out
3. Sign up as User B
4. User B should NOT see User A's notes

✅ **Expected**: Complete data isolation

---

## Step 4: Existing Users (Migration)

For users who already have plaintext notes:

**Option A**: Gradual migration (recommended)
- Existing notes remain plaintext
- New notes are encrypted
- User can manually re-encrypt old notes later

**Option B**: Force re-encryption
- On first encryption setup, encrypt all existing notes
- Requires downloading all notes, encrypting, and re-uploading

*For beta, Option A is simpler and less risky.*

---

## Common Issues & Fixes

### Issue: "Encryption not properly set up" error

**Fix**: 
```sql
-- Check user profile has encryption fields
SELECT encryption_enabled, encryption_salt, encryption_test_payload
FROM user_profiles
WHERE user_id = 'problem-user-id';

-- If NULL, encryption wasn't set up properly
-- User needs to go through setup again
```

### Issue: Can't decrypt notes

**Possible causes**:
1. Wrong password → User must enter correct password
2. Corrupted encrypted_content → Database issue
3. Browser incompatibility → Use Chrome 80+ or Firefox 75+

**Fix**: Check browser console for specific error

### Issue: AI analysis fails

**Possible causes**:
1. Vault is locked → Must unlock first
2. Groq API key issues → Check API key

**Debug**:
```javascript
// Check if encryption is active
console.log(encryptionService.isEncryptionActive()); // Should be true
```

---

## Rollback Plan (If Needed)

If encryption causes issues during beta:

1. **Temporarily disable for new signups**:
   ```typescript
   // In EncryptionGate.tsx
   const isNewUser = false; // Skip encryption setup
   ```

2. **Keep existing encrypted users working**:
   - Don't remove encryption code
   - They can still unlock and use their vaults

3. **Fix issues**, then re-enable

---

## Beta Testing Checklist

- [ ] Database migration successful
- [ ] New user signup → Encryption setup works
- [ ] Login → Unlock vault works
- [ ] Create note → Auto-encrypts
- [ ] Update note → Re-encrypts with changes
- [ ] AI analysis → Works with encrypted notes
- [ ] Delete note → Works
- [ ] Cross-device test (same account, different browser)
- [ ] Wrong password → Shows error
- [ ] Logout → Clears encryption key from memory
- [ ] Multiple users → No data leakage

---

## Performance Monitoring

Watch for:
- Encryption time: Should be <50ms per note
- Page load time: Should not increase significantly
- Memory usage: Should remain stable

**If slow**:
- Check iteration count (currently 100,000 - can reduce to 50,000 for speed)
- Consider caching decrypted notes in memory (security tradeoff)

---

## Next Steps After Beta

1. **Add to landing page**:
   ```markdown
   "🔐 Zero-Knowledge Encryption
   Your journals are encrypted on your device before storage.
   We literally cannot read them, even if we wanted to."
   ```

2. **Add to settings**:
   - View encryption status
   - Change encryption password
   - Download recovery key
   - Disable encryption (decrypt all notes)

3. **Add recovery flow**:
   - Import recovery key
   - Decrypt vault with recovery key
   - Reset password

4. **Monitor**:
   - Track encryption adoption rate
   - Collect feedback on UX
   - Watch for error patterns

---

## Support Scripts

### Check Encryption Status
```sql
SELECT 
  u.email,
  u.encryption_enabled,
  COUNT(n.id) as total_notes,
  COUNT(n.encrypted_content) as encrypted_notes
FROM user_profiles u
LEFT JOIN notes n ON n.user_id = u.user_id
GROUP BY u.id, u.email, u.encryption_enabled;
```

### Find Encryption Errors
```javascript
// In browser console
const notes = await supabase.from('notes').select('*');
for (const note of notes.data) {
  try {
    if (note.encrypted_content) {
      JSON.parse(note.encrypted_content);
    }
  } catch (e) {
    console.error('Corrupted note:', note.id);
  }
}
```

---

**You're ready to launch with E2E encryption! 🎉**

Test thoroughly with your friends before wider release. Good luck! 🚀
