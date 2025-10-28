# Debug Guide: User rwb44 Missing Notes Issue

## Problem Summary
- User "rwb44" can see 3 notes in the "My Notes" page grid view
- Sidebar shows "My Notes (0)" - no notes in the list
- User closed Chrome profile and lost notes (but they're still visible)

## Root Cause Analysis

### Likely Issues:
1. **Storage Mode Mismatch**: Notes might be in localStorage but app is checking Supabase (or vice versa)
2. **User ID Mismatch**: Notes associated with wrong user_id in database
3. **Session Issue**: User logged in with different account than the one that created notes
4. **Encryption Key Loss**: If notes are encrypted, key might be lost after closing Chrome profile

## Step 1: Run SQL Diagnostics

Execute the queries in `debug-user-notes.sql` in your Supabase SQL Editor:

```sql
-- 1. Find user ID
SELECT id, email, username, created_at
FROM user_profiles
WHERE username = 'rwb44';
```

**Expected Output**: Should return 1 row with user_id

```sql
-- 2. Count notes for this user
SELECT COUNT(*) as total_notes, user_id
FROM diary_entries
WHERE user_id IN (SELECT id FROM user_profiles WHERE username = 'rwb44')
GROUP BY user_id;
```

**Expected Output**: Should show 3 notes if they're in the database

```sql
-- 3. Get note details
SELECT 
  de.id,
  de.user_id,
  de.title,
  de.date,
  de.created_at,
  LENGTH(de.content) as content_length
FROM diary_entries de
WHERE de.user_id IN (SELECT id FROM user_profiles WHERE username = 'rwb44')
ORDER BY de.date DESC;
```

**Expected Output**: Should show the 3 notes with titles matching the screenshot

## Step 2: Check Storage Mode

The app uses `storageAdapter` which can use either:
- **localStorage** (local browser storage)
- **Supabase** (cloud database with encryption)

### Check Current Storage Mode:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('insightai-storage-mode')`
4. Result:
   - `"local"` = Using localStorage
   - `"supabase"` or `null` = Using Supabase

### Check localStorage Notes:
```javascript
// In browser console:
const localNotes = localStorage.getItem('insightai-notes');
console.log(JSON.parse(localNotes || '[]'));
```

## Step 3: Identify the Issue

### Scenario A: Notes in localStorage, App Using Supabase
**Symptoms**: 
- localStorage has notes
- Supabase query returns 0 notes
- Storage mode is "supabase"

**Solution**: Migrate notes from localStorage to Supabase
```sql
-- You'll need to manually insert notes or use the app's migration feature
```

### Scenario B: Notes in Supabase, Wrong User ID
**Symptoms**:
- Supabase has 3 notes
- Notes have different user_id than current session
- User might have multiple accounts

**Solution**: Find the correct user_id and reassociate notes
```sql
-- Find notes that might belong to this user (by date/title)
SELECT id, user_id, title, date, created_at
FROM diary_entries
WHERE title LIKE '%Tuesday 28 OCT 25%'
   OR title LIKE '%Mon 27 OCT 25%'
   OR title LIKE '%Sun 26 OCT 25%'
ORDER BY created_at DESC;

-- If found with wrong user_id, update them:
-- CAREFUL: Only run this after confirming the notes belong to rwb44!
UPDATE diary_entries
SET user_id = (SELECT id FROM user_profiles WHERE username = 'rwb44')
WHERE id IN ('note_id_1', 'note_id_2', 'note_id_3');
```

### Scenario C: Encryption Key Lost
**Symptoms**:
- Notes exist in Supabase
- Notes are encrypted
- User lost encryption key after closing Chrome profile

**Solution**: Notes cannot be decrypted without the key (this is by design for security)
- User would need to create new notes
- Old notes would remain encrypted and inaccessible

## Step 4: Safe Fix Commands

### Option 1: Reassociate Notes (if wrong user_id)
```sql
-- First, verify the notes and user:
SELECT 
  de.id,
  de.title,
  de.user_id as current_user_id,
  up.username as current_username,
  (SELECT id FROM user_profiles WHERE username = 'rwb44') as target_user_id
FROM diary_entries de
LEFT JOIN user_profiles up ON de.user_id = up.id
WHERE de.title IN ('Tuesday 28 OCT 25', 'Mon 27 OCT 25', 'Sun 26 OCT 25');

-- If confirmed, update:
UPDATE diary_entries
SET user_id = (SELECT id FROM user_profiles WHERE username = 'rwb44')
WHERE title IN ('Tuesday 28 OCT 25', 'Mon 27 OCT 25', 'Sun 26 OCT 25')
  AND user_id != (SELECT id FROM user_profiles WHERE username = 'rwb44');
```

### Option 2: Check for Orphaned Notes
```sql
-- Find notes without a valid user_id
SELECT id, user_id, title, date
FROM diary_entries
WHERE user_id IS NULL
   OR user_id NOT IN (SELECT id FROM user_profiles);
```

## Step 5: Verify Fix

After running fixes:
1. Have user refresh the page (hard refresh: Ctrl+Shift+R)
2. Check sidebar count: Should show "My Notes (3)"
3. Verify notes are clickable in sidebar
4. Confirm notes content is accessible

## Prevention

To prevent this in the future:
1. Ensure users understand closing Chrome profile = losing localStorage data
2. Encourage users to use Supabase storage (cloud backup)
3. Add a warning when switching storage modes
4. Implement automatic migration prompts

## Safety Notes

⚠️ **IMPORTANT**:
- Never run UPDATE queries without WHERE clause
- Always verify user_id before reassociating notes
- Back up data before making changes
- Test queries with SELECT before UPDATE
- Your notes are safe - they have your user_id and won't be affected
