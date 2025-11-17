# Cross-Device Sync Migration Plan

## Current State Analysis

### What's Already Synced ✅
- **Notes/Journal Entries** - Stored in Supabase `notes` table
- **User Authentication** - Supabase Auth
- **AI Analysis Results** - Stored in `notes.ai_insights` and `notes.ai_structured_insights`

### What's NOT Synced (localStorage only) ❌

#### 1. **Actionable Insights / Strategies**
- **Desktop:** `localStorage` key: `insightai_<userId>_actionable_insights`
- **Mobile:** `AsyncStorage` key: `actionable_insights_<userId>`
- **Service:** `src/services/actionableInsightsService.ts`
- **Impact:** Your Playbook strategies don't sync between devices

#### 2. **Insight Progress Tracking**
- **Desktop:** `localStorage` key: `insightai_<userId>_insight_progress`
- **Service:** `src/services/actionableInsightsService.ts`
- **Impact:** Strategy attempt counts, effectiveness ratings, and user notes don't sync

#### 3. **Daily Protocols**
- **Desktop:** `localStorage` keys:
  - `insightai_daily_protocols`
  - `insightai_daily_completions`
- **Service:** `src/services/dailyProtocolService.ts`
- **Impact:** Morning routines, daily habits, and completion streaks don't sync

#### 4. **User Preferences (Minor)**
- **Desktop:** Various `localStorage` keys for UI preferences
- **Impact:** Theme, settings, onboarding state don't sync (less critical)

---

## Migration Strategy

### Phase 1: Database Schema ✅ COMPLETE

**File:** `supabase/migrations/20251117_add_playbook_tables.sql`

Created 5 new Supabase tables:

1. **`actionable_insights`** - Stores strategies (AI-suggested and user-created)
   - Fields: title, description, category, difficulty, emoji, status, source, dates
   - RLS enabled for user isolation

2. **`insight_progress`** - Tracks attempts and effectiveness
   - Fields: attempts, success_count, effectiveness, last_attempt_date
   - One record per insight per user

3. **`insight_progress_notes`** - User notes for each attempt
   - Linked to `insight_progress`

4. **`daily_protocols`** - Recurring daily habits
   - Fields: title, description, category, emoji, is_active, reminder_time
   - Categories: morning, afternoon, evening, anytime

5. **`daily_completions`** - Daily protocol completion tracking
   - One record per protocol per day
   - Used for streak calculations

### Phase 2: Run the Migration

```bash
# From project root
cd supabase
supabase db push

# Or if using Supabase CLI with remote project
supabase db push --linked
```

### Phase 3: Update Services (Code Changes Required)

#### A. Update `actionableInsightsService.ts`

**Current:** Uses `localStorage.getItem()` and `localStorage.setItem()`

**New:** Use Supabase client

```typescript
// Example transformation
// OLD:
async getInsights(): Promise<ActionableInsight[]> {
  const key = await this.getStorageKey('actionable_insights');
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

// NEW:
async getInsights(): Promise<ActionableInsight[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('actionable_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading insights:', error);
    return [];
  }
  
  return data || [];
}
```

#### B. Update `dailyProtocolService.ts`

**Current:** Uses `localStorage` with keys `insightai_daily_protocols` and `insightai_daily_completions`

**New:** Use Supabase for both protocols and completions

```typescript
// Similar pattern - replace localStorage with Supabase queries
```

#### C. Update Mobile `PlaybookScreen.tsx`

**Current:** Uses `AsyncStorage.getItem(\`actionable_insights_\${user.id}\`)`

**New:** Use same Supabase service as desktop

```typescript
import { supabase } from '../lib/supabase';

const loadStrategies = async () => {
  if (!user) return;
  
  const { data, error } = await supabase
    .from('actionable_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[Mobile Playbook] Error loading strategies:', error);
    return;
  }
  
  console.log('[Mobile Playbook] strategies loaded from Supabase', data);
  setStrategies(data || []);
};
```

### Phase 4: Data Migration Script (One-Time)

Create a migration utility to move existing localStorage data to Supabase:

**File:** `src/utils/migratePlaybookToSupabase.ts`

```typescript
export async function migratePlaybookToSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // 1. Migrate actionable insights
  const insightsKey = `insightai_${user.id}_actionable_insights`;
  const storedInsights = localStorage.getItem(insightsKey);
  if (storedInsights) {
    const insights = JSON.parse(storedInsights);
    for (const insight of insights) {
      await supabase.from('actionable_insights').insert({
        user_id: user.id,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        difficulty: insight.difficulty,
        emoji: insight.emoji,
        status: insight.status,
        source: insight.source,
        // ... map other fields
      });
    }
    console.log('✅ Migrated actionable insights');
  }
  
  // 2. Migrate daily protocols
  const protocolsStored = localStorage.getItem('insightai_daily_protocols');
  if (protocolsStored) {
    const protocols = JSON.parse(protocolsStored);
    for (const protocol of protocols) {
      await supabase.from('daily_protocols').insert({
        user_id: user.id,
        title: protocol.title,
        description: protocol.description,
        category: protocol.category,
        emoji: protocol.emoji,
        is_active: protocol.isActive,
        // ... map other fields
      });
    }
    console.log('✅ Migrated daily protocols');
  }
  
  // 3. Migrate completions
  const completionsStored = localStorage.getItem('insightai_daily_completions');
  if (completionsStored) {
    const completions = JSON.parse(completionsStored);
    for (const completion of completions) {
      await supabase.from('daily_completions').insert({
        user_id: user.id,
        protocol_id: completion.protocolId, // Will need ID mapping
        date: completion.date,
        completed_at: completion.completedAt,
      });
    }
    console.log('✅ Migrated daily completions');
  }
}
```

Call this once on desktop after updating the services.

---

## Implementation Checklist

### Immediate (Required for Playbook Sync)

- [x] Create SQL migration file
- [ ] Run migration on Supabase
- [ ] Update `actionableInsightsService.ts` to use Supabase
- [ ] Update `dailyProtocolService.ts` to use Supabase
- [ ] Update mobile `PlaybookScreen.tsx` to use Supabase
- [ ] Update mobile `EntryDetailScreen.tsx` to save to Supabase instead of AsyncStorage
- [ ] Create and run one-time migration script for existing data
- [ ] Test on desktop: create strategy → see on mobile
- [ ] Test on mobile: analyze entry → see strategies on desktop

### Optional (Nice to Have)

- [ ] Migrate user preferences to Supabase
- [ ] Add real-time subscriptions for live sync
- [ ] Add offline support with sync queue
- [ ] Migrate theme preferences

---

## Testing Plan

1. **Desktop → Mobile Sync**
   - Create a new strategy on desktop
   - Open mobile app
   - Verify strategy appears in Playbook

2. **Mobile → Desktop Sync**
   - Analyze an entry on mobile
   - Check desktop Playbook
   - Verify AI-suggested strategies appear

3. **Protocol Sync**
   - Create a daily protocol on desktop
   - Complete it on mobile
   - Verify streak updates on both devices

4. **Conflict Resolution**
   - Create same-titled strategy on both devices while offline
   - Go online
   - Verify no duplicates (Supabase handles this with timestamps)

---

## Rollback Plan

If issues arise:

1. Keep localStorage/AsyncStorage code as fallback
2. Add feature flag: `USE_SUPABASE_PLAYBOOK`
3. Can switch back to local storage if needed
4. Data in Supabase remains safe

---

## Benefits After Migration

✅ **True Cross-Device Sync** - Strategies, protocols, and progress sync instantly

✅ **No Data Loss** - Cloud backup of all playbook data

✅ **Consistent Experience** - Same data on web, iOS, Android

✅ **Real-time Updates** - Changes propagate immediately (with subscriptions)

✅ **Scalable** - Ready for future features like sharing strategies

---

## Next Steps

1. **Run the SQL migration** (I've created the file)
2. **I'll update the services** to use Supabase instead of localStorage
3. **Test thoroughly** on both platforms
4. **Deploy** and enjoy cross-device sync!

Let me know when you're ready to proceed with Phase 2 (running the migration).
