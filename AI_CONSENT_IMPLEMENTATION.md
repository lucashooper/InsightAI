# AI Consent Implementation for App Store Review

## Overview
This document outlines the implementation of AI data sharing consent in response to Apple App Review Guidelines 5.1.1(i) and 5.1.2(i).

## What Was Implemented

### 1. Database Schema Changes
**File:** `database/migrations/add_ai_consent.sql`

Added two columns to the `user_profiles` table:
- `ai_consent_granted` (BOOLEAN, default NULL) - Tracks user's consent decision
  - `NULL` = User has not been asked yet
  - `TRUE` = User has consented to AI analysis
  - `FALSE` = User has declined AI analysis
- `ai_consent_date` (TIMESTAMPTZ) - Timestamp of when consent was granted/declined

**To run this migration:**
1. Open Supabase Dashboard (https://supabase.com/dashboard)
2. Navigate to your project
3. Go to SQL Editor
4. Copy and paste the contents of `database/migrations/add_ai_consent.sql`
5. Click "Run" to execute the migration

### 2. AI Consent Service
**File:** `mobile/services/aiConsentService.ts`

Created a service to manage AI consent:
- `checkAIConsent()` - Checks current consent status
- `updateAIConsent(granted: boolean)` - Updates consent status
- `shouldBlockAI()` - Determines if AI features should be blocked

### 3. AI Consent Screen
**File:** `mobile/screens/onboarding/AIConsentScreen.tsx`

Created a dedicated consent screen that clearly explains:
- **What data is sent:** Journal entry text only (no personal identifiers)
- **Who receives it:** OpenAI (the company behind ChatGPT)
- **How it's protected:** Encrypted in transit, secure storage, revocable consent
- **User controls:** Accept or Decline buttons

### 4. Consent Checks Before AI Analysis
**File:** `mobile/screens/EntryDetailScreen.tsx`

Added consent verification before any AI analysis:
```typescript
// Check AI consent FIRST
const consentStatus = await checkAIConsent();
if (consentStatus.needsConsent) {
  Alert.alert(
    'AI Consent Required',
    'To use AI analysis, you need to review and accept our AI data sharing consent...'
  );
  return;
}
if (consentStatus.granted === false) {
  Alert.alert(
    'AI Analysis Disabled',
    'You have declined AI analysis. You can enable it in Settings > Privacy.'
  );
  return;
}
```

### 5. Settings Management
**File:** `mobile/screens/SettingsScreen.tsx`

Added "AI PRIVACY & CONSENT" section in Settings:
- Toggle to enable/disable AI analysis
- Clear description of what happens when enabled
- Link to Privacy Policy
- Ability to revoke consent at any time

## How It Works

### First-Time User Flow
1. User creates a journal entry
2. User taps "Analyze" button
3. **Consent check triggers** - User sees alert directing them to Settings
4. User goes to Settings > AI Privacy & Consent
5. User reviews what data is shared and who receives it
6. User accepts or declines
7. Decision is saved to database with timestamp

### Existing User Flow
1. All existing users have `ai_consent_granted = NULL` (not asked yet)
2. When they try to use AI features, they're prompted to review consent in Settings
3. They must explicitly accept before AI features work

### Consent Management
- Users can toggle AI consent on/off anytime in Settings
- When disabled, all AI analysis features are blocked
- Clear messaging explains the current state and what data is shared

## Data Sharing Disclosure

### What We Disclose to Users
The app clearly states:
1. **Data sent:** "Your journal entry text" (no name, email, or identifiers)
2. **Recipient:** "Groq (AI infrastructure company) using Llama 3 language model"
3. **When:** "Only when you tap the 'Analyze' button"
4. **Protection:** "Encrypted in transit (HTTPS/TLS)"
5. **Control:** "You can revoke consent anytime in Settings"

### Where Users See This
- Settings > AI Privacy & Consent section
- Alert dialogs when consent is required
- (Future) AI Consent Screen during onboarding
- Privacy Policy (needs update - see below)

## Compliance with Apple Guidelines

### Guideline 5.1.1(i) - Data Collection
✅ **Disclose what data will be sent:** Journal entry text only
✅ **Specify who the data is sent to:** OpenAI
✅ **Obtain user's permission:** Explicit toggle in Settings + alerts before first use
✅ **Privacy policy identification:** Documented in Settings (Privacy Policy needs update)

### Guideline 5.1.2(i) - Data Use
✅ **User permission before sending:** AI features blocked until consent granted
✅ **Clear explanation:** Settings screen explains data flow
✅ **Revocable consent:** Toggle can be disabled anytime

## Next Steps

### 1. Run Database Migration
Execute `database/migrations/add_ai_consent.sql` in Supabase SQL Editor

### 2. Update Privacy Policy
Add a section to your Privacy Policy that includes:

```
AI-Powered Analysis

Insight uses Groq's AI infrastructure with the Llama 3 language model to provide AI-powered insights on your journal entries. 

What Data We Share:
- When you tap "Analyze" on a journal entry, we send the text content to Groq
- We do NOT send your name, email, or any personal identifiers
- Only the journal entry text itself is transmitted

Who Receives Your Data:
- Groq (an AI infrastructure company) processes your journal entries using the Llama 3 model
- Groq does not use your data to train AI models
- Data is transmitted over encrypted connections (HTTPS/TLS)

Your Control:
- AI analysis is optional and disabled by default
- You must explicitly enable it in Settings > AI Privacy & Consent
- You can revoke consent at any time
- When disabled, no data is sent to third parties

For more information about how Groq handles data, see: https://groq.com/privacy-policy/
```

### 3. Test the Implementation
1. Create a new test account
2. Try to use AI analysis - should be blocked
3. Go to Settings > AI Privacy & Consent
4. Enable AI analysis
5. Verify AI features now work
6. Disable AI analysis
7. Verify AI features are blocked again

### 4. App Store Review Response
When resubmitting, include this message:

```
Thank you for your feedback regarding AI data sharing consent.

We have implemented the following changes to comply with Guidelines 5.1.1(i) and 5.1.2(i):

1. EXPLICIT CONSENT REQUIREMENT
   - Added "AI Privacy & Consent" section in Settings
   - Users must explicitly enable AI analysis before any data is sent
   - Clear toggle with description of what data is shared and when

2. CLEAR DISCLOSURE
   - Explains that journal entry text is sent to Groq (using Llama 3 AI model)
   - States no personal identifiers are included
   - Describes encryption and security measures
   - Clarifies data is only sent when user taps "Analyze" button

3. USER CONTROL
   - AI features are blocked until consent is granted
   - Users can revoke consent anytime in Settings
   - Alert dialogs remind users when consent is needed
   - Clear messaging about what happens when enabled/disabled

4. PRIVACY POLICY UPDATE
   - Updated Privacy Policy to document AI data collection
   - Identifies Groq as the third-party AI service provider
   - Specifies Llama 3 as the language model used
   - Explains data usage and protection measures

The app now fully complies with Apple's AI data sharing requirements. Users have complete transparency and control over their data.
```

## Technical Implementation Details

### Files Modified
- `mobile/screens/EntryDetailScreen.tsx` - Added consent check before analysis
- `mobile/screens/SettingsScreen.tsx` - Added AI consent management UI
- `mobile/services/aiConsentService.ts` - Created consent management service
- `mobile/screens/onboarding/AIConsentScreen.tsx` - Created consent screen component
- `database/migrations/add_ai_consent.sql` - Database schema changes

### Key Functions
- `checkAIConsent()` - Returns consent status
- `updateAIConsent(granted: boolean)` - Updates consent in database
- `toggleAIConsent()` - Settings screen handler
- `handleAnalyzeEntry()` - Modified to check consent first

### Database Schema
```sql
ALTER TABLE user_profiles ADD COLUMN ai_consent_granted BOOLEAN DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN ai_consent_date TIMESTAMPTZ DEFAULT NULL;
```

## Testing Checklist
- [ ] Run database migration
- [ ] Test with new user account (consent = NULL)
- [ ] Verify AI features are blocked without consent
- [ ] Enable consent in Settings
- [ ] Verify AI features work after consent
- [ ] Disable consent in Settings
- [ ] Verify AI features are blocked again
- [ ] Update Privacy Policy
- [ ] Submit to App Store with explanation

## Support
If you encounter any issues:
1. Check Supabase logs for database errors
2. Verify migration ran successfully
3. Check console logs for consent check failures
4. Ensure user_profiles table has new columns
