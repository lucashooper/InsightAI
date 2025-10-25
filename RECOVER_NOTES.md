# 🚨 How to Recover Your Notes

## ⚠️ **What Happened**

Your notes were stored in **localStorage** (browser storage) with the key `insight_ai_diary_entries`.

When we implemented the account switching fix, it clears all `insight_ai_*` data from localStorage when you switch accounts. This was designed to prevent data mixing, but it also cleared your notes.

---

## 🔍 **Where Are Your Notes?**

### **Option 1: Still in Browser (Old Account)**

If you haven't cleared your browser cache/data, your notes might still exist in localStorage under a different account.

**Try this:**
1. Open **Browser DevTools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → Your site URL
4. Look for key: `insight_ai_diary_entries`
5. If it exists, copy the entire value

### **Option 2: In Supabase Database**

Check if notes were synced to Supabase:

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Look for `notes` or `diary_entries` table
4. Check if your notes are there
5. Filter by your user email: `edwardsjonny547@gmail.com`

---

## 📋 **Recovery Steps**

### **Method 1: Check Browser DevTools**

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Paste this code:

```javascript
// Check for notes in localStorage
const notesData = localStorage.getItem('insight_ai_diary_entries');
if (notesData) {
  const notes = JSON.parse(notesData);
  console.log(`✅ Found ${notes.length} notes!`);
  notes.forEach(note => {
    console.log(`- ${note.title} (Created: ${note.created_at})`);
  });
  
  // Export to file
  const dataStr = JSON.stringify(notes, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'notes_backup.json';
  link.click();
  console.log('📥 Notes exported to notes_backup.json');
} else {
  console.log('❌ No notes found in localStorage');
}
```

4. If notes found, it will download `notes_backup.json`

---

### **Method 2: Check Other Browsers/Profiles**

Did you use a different browser or profile before?

1. Try opening the app in:
   - Chrome
   - Firefox
   - Edge
   - Incognito/Private windows you may have used
2. Check localStorage in each one

---

### **Method 3: Check Browser History**

If you can't find the notes but remember when you created them:

1. Open browser history
2. Look for dates when you used InsightAI
3. See if you can identify which account/session had the notes

---

## 💾 **Import Notes Back**

If you recover the JSON backup:

1. Sign into the correct account
2. Open DevTools Console (F12)
3. Paste this code:

```javascript
// PASTE YOUR NOTES JSON HERE
const recoveredNotes = [
  // Your notes array from the backup
];

// Import to localStorage
localStorage.setItem('insight_ai_diary_entries', JSON.stringify(recoveredNotes));
console.log(`✅ Imported ${recoveredNotes.length} notes!`);

// Reload page
location.reload();
```

---

## 🔒 **Prevent This in the Future**

### **Option 1: Use Supabase Sync**

The app should sync notes to Supabase database, not just localStorage.

Check if `USE_LOCAL_STORAGE` is set to `false` in your code. This ensures notes are saved to database.

### **Option 2: Regular Backups**

Add a backup button in Settings:

```javascript
// Export all notes
const backup = await storageAdapter.exportData();
const json = JSON.stringify(backup, null, 2);
// Download as file
```

---

## 🎯 **Quick Check Right Now**

1. Open DevTools (F12)
2. Go to **Console**
3. Type: `localStorage.getItem('insight_ai_diary_entries')`
4. Press Enter

**Results:**
- `null` = No notes in current localStorage ❌
- Long string = Notes exist! ✅

---

## 📧 **If Notes Are Lost**

If you can't recover them:

1. **Check browser backup/sync**
   - Chrome: Settings → Sync → Manage
   - Edge: Settings → Profiles → Sync
   
2. **Check system restore points**
   - Windows: System Properties → System Restore
   - Might have old browser data

3. **Check Supabase Database**
   - Your notes might be there even if localStorage is empty
   - We can write a recovery script

---

## 🚨 **Emergency: Export Current Data**

Do this RIGHT NOW before any more data loss:

```javascript
// Run in DevTools Console
const allLocalStorage = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('insight_ai_')) {
    allLocalStorage[key] = localStorage.getItem(key);
  }
}
console.log('All InsightAI data:', allLocalStorage);

// Download backup
const blob = new Blob([JSON.stringify(allLocalStorage, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'insightai_full_backup.json';
a.click();
```

This will backup EVERYTHING from localStorage right now.

---

**Don't panic! The data might still be recoverable. Try the methods above in order.** 🙏
