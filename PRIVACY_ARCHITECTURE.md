# Privacy Architecture for Insight AI

## Overview
Dual-mode privacy system allowing users to choose between fully private local storage or secure cloud storage with sync capabilities.

---

## Storage Options

### Option 1: Fully Private (Local-Only) ✅
**Technology Stack:**
- **Primary:** SQLite (via `expo-sqlite` or `react-native-sqlite-storage`)
- **Backup:** Encrypted local file system
- **AI Processing:** On-device or API calls (data never stored in cloud)

**Pros:**
- ✅ Complete privacy - data never leaves device
- ✅ Works offline by default
- ✅ No account required (optional)
- ✅ Complies with strictest privacy regulations
- ✅ No subscription needed for storage

**Cons:**
- ❌ No sync across devices
- ❌ Data lost if device is lost (unless manually backed up)
- ❌ No web access
- ❌ Limited by device storage
- ❌ Manual backup/restore required

**Apple Policy:** ✅ Fully allowed - apps can store unlimited data locally using SQLite, Core Data, or file system

---

### Option 2: Secure Cloud Storage (Current)
**Technology Stack:**
- **Primary:** Supabase PostgreSQL
- **Encryption:** End-to-end encryption option (encrypt before sending)
- **Backup:** Automatic cloud backups

**Pros:**
- ✅ Sync across all devices (iPhone, iPad, Mac, Web)
- ✅ Automatic backups
- ✅ Access from anywhere
- ✅ Data preserved if device is lost
- ✅ Easier to implement advanced features

**Cons:**
- ❌ Data stored in cloud (even if encrypted)
- ❌ Requires internet connection for sync
- ❌ Requires account creation
- ❌ Potential privacy concerns for some users

---

## Recommended Implementation

### Phase 1: Core Architecture (Week 1-2)

#### 1. Storage Abstraction Layer
Create a unified interface that works with both storage modes:

```typescript
// /mobile/services/storageService.ts
interface StorageService {
  // Entries
  createEntry(entry: Entry): Promise<Entry>;
  getEntries(userId: string): Promise<Entry[]>;
  updateEntry(id: string, updates: Partial<Entry>): Promise<Entry>;
  deleteEntry(id: string): Promise<void>;
  
  // User data
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;
  
  // Mode
  getStorageMode(): 'local' | 'cloud';
}
```

#### 2. Local Storage Implementation (SQLite)
```bash
# Install dependencies
npx expo install expo-sqlite
npm install @react-native-async-storage/async-storage
```

**Database Schema:**
```sql
-- entries table
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT,
  mood TEXT,
  created_at TEXT,
  updated_at TEXT,
  ai_insights TEXT, -- JSON string
  ai_structured_insights TEXT -- JSON string
);

-- user_profiles table
CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,
  created_at TEXT
);

-- settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

#### 3. Cloud Storage Implementation (Current Supabase)
Keep existing implementation, wrap in abstraction layer.

---

### Phase 2: Onboarding Privacy Choice (Week 2)

#### Privacy Choice Screen Design

**Screen Flow:**
1. Welcome screens (existing)
2. **NEW: Privacy Choice Screen** ← Insert here
3. Auth/Account creation (if cloud mode)
4. Onboarding questions
5. Dashboard

**Privacy Choice Screen UI:**

```
┌─────────────────────────────────┐
│  Choose Your Privacy Level      │
│                                  │
│  ┌───────────────────────────┐  │
│  │  🔒 Fully Private         │  │
│  │  (Local Only)             │  │
│  │                           │  │
│  │  • Data never leaves      │  │
│  │    your device            │  │
│  │  • Complete privacy       │  │
│  │  • Works offline          │  │
│  │  • No account needed      │  │
│  │                           │  │
│  │  ⚠️ No sync, no backup    │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │  ☁️ Secure Cloud          │  │
│  │  (Recommended)            │  │
│  │                           │  │
│  │  • Sync across devices    │  │
│  │  • Automatic backups      │  │
│  │  • Access anywhere        │  │
│  │  • End-to-end encrypted   │  │
│  │                           │  │
│  │  ℹ️ Requires account      │  │
│  └───────────────────────────┘  │
│                                  │
│  You can change this later       │
│  in Settings                     │
└─────────────────────────────────┘
```

---

### Phase 3: Hybrid Features (Week 3-4)

#### AI Processing in Local Mode
**Options:**

1. **API Calls Only (Recommended)**
   - Send entry content to OpenAI/Claude API
   - Receive analysis back
   - Store analysis locally
   - Data not stored on our servers
   - User pays for API usage or we subsidize

2. **On-Device AI (Future)**
   - Use smaller models (Llama 3.2, Gemini Nano)
   - Runs entirely on device
   - Slower, less capable
   - No internet required

#### Manual Backup/Restore for Local Mode
```typescript
// Export to encrypted JSON file
async function exportLocalData(): Promise<string> {
  // Get all data from SQLite
  // Encrypt with user password
  // Return as shareable file
}

// Import from encrypted JSON file
async function importLocalData(file: string, password: string): Promise<void> {
  // Decrypt file
  // Validate schema
  // Import to SQLite
}
```

---

### Phase 4: Migration & Settings (Week 4)

#### Settings Toggle
Allow users to switch modes with clear warnings:

**Local → Cloud:**
- "Upload all your data to secure cloud storage?"
- "This will create an account and sync your entries"
- Show data size and estimated upload time

**Cloud → Local:**
- "⚠️ Warning: This will download all data and delete from cloud"
- "You'll lose sync and backup capabilities"
- "Are you sure?"

---

## Privacy Messaging

### Marketing Copy

**For Privacy-Conscious Users:**
> "Your thoughts are yours alone. Choose Fully Private mode and your journal never leaves your device. No servers, no cloud, no tracking. Just you and your reflections."

**For Convenience Users:**
> "Seamlessly sync across all your devices with bank-level encryption. Your data is encrypted end-to-end, and only you hold the keys."

### Privacy Policy Highlights
- **Local Mode:** We never see your data. AI processing happens via API calls only.
- **Cloud Mode:** Data encrypted in transit and at rest. We cannot read your entries.
- **No Selling:** We never sell or share your data. Ever.
- **Open Source:** Code is auditable (if you choose to open source)

---

## Technical Considerations

### 1. Authentication in Local Mode
**Option A:** No auth required
- Generate random device ID
- Store locally
- Simple but no account recovery

**Option B:** Optional account (recommended)
- Allow creating account later
- Keeps local data separate
- Can upgrade to cloud mode easily

### 2. AI API Keys
**Local Mode:**
- User can provide their own OpenAI/Claude API key
- Or use our subsidized API (with usage limits)
- Transparent about API calls

**Cloud Mode:**
- We handle all API calls
- Included in subscription

### 3. Data Encryption
**Local Mode:**
- SQLite database encrypted with SQLCipher
- User sets encryption password on first launch
- Biometric unlock (Face ID/Touch ID)

**Cloud Mode:**
- End-to-end encryption option
- Encrypt before sending to Supabase
- Encryption key derived from user password (never sent to server)

---

## Implementation Priority

### Must Have (MVP)
1. ✅ Storage abstraction layer
2. ✅ SQLite local storage implementation
3. ✅ Privacy choice onboarding screen
4. ✅ Settings toggle to switch modes
5. ✅ Basic local backup/export

### Should Have (V1.1)
6. End-to-end encryption for cloud mode
7. Biometric unlock for local mode
8. Automatic local backups to iCloud Drive
9. Migration wizard with progress bar

### Nice to Have (V2.0)
10. On-device AI processing
11. Peer-to-peer sync (no cloud)
12. Self-hosted server option
13. Zero-knowledge architecture

---

## Competitive Analysis

**Apps with Local-Only Mode:**
- **Day One:** Offers local-only with optional sync
- **Journey:** Local-first with cloud backup
- **Diarly:** Fully local with manual sync

**Privacy-First Apps:**
- **Standard Notes:** End-to-end encrypted, open source
- **Cryptee:** Zero-knowledge, encrypted
- **Joplin:** Open source, self-hostable

**Your Advantage:**
- AI-powered insights with privacy
- User choice (not forced into cloud)
- Transparent about data handling
- Can market to both privacy advocates AND convenience users

---

## Cost Implications

### Local Mode
- **Development:** +2-3 weeks initial, +1 week maintenance
- **Support:** Higher (backup/restore issues)
- **Revenue:** Lower (no recurring storage costs to justify subscription)

### Cloud Mode
- **Infrastructure:** Supabase costs scale with users
- **Development:** Already built
- **Support:** Lower (automatic backups)
- **Revenue:** Higher (can justify subscription for sync/backup)

### Recommendation
Offer both, but make cloud mode the default/recommended option. Privacy-conscious users will seek out local mode, while most users will prefer convenience.

---

## Next Steps

1. **Validate with users:** Survey target audience about privacy preferences
2. **Build storage abstraction layer:** 1 week
3. **Implement SQLite storage:** 1 week
4. **Create privacy choice screen:** 2 days
5. **Add settings toggle:** 2 days
6. **Test migration flows:** 3 days
7. **Update privacy policy:** 1 day

**Total Time Estimate:** 3-4 weeks for full implementation

---

## Questions to Answer

1. **Monetization:** How do you charge for local-only mode? One-time purchase?
2. **AI Costs:** Who pays for API calls in local mode?
3. **Support:** How do you help users who lose local data?
4. **Marketing:** Do you emphasize privacy or convenience?
5. **Default:** Which mode is default for new users?

My recommendation: **Cloud mode as default, local mode as premium privacy option.** This balances business needs with user privacy concerns.
