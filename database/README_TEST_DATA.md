# Test Data Setup for Marketing Screenshots

## Overview
This guide explains how to set up the `coffeeappofficial@gmail.com` test account with balanced, marketing-optimized journal entries.

## Emotional Balance Strategy
The test data follows marketing psychology best practices:
- **60-70% positive/growth emotions**: grateful, calm, confident, joyful, motivated, proud
- **30-40% realistic challenges**: overwhelmed, anxious, frustrated (but with resolution/insight)
- **Key message**: The app helps users understand and work through emotions, showing progress and hope

## Emotional Landscape You'll See
After running the script, the dashboard will show:
- **Most recurring emotion**: "grateful" (~35%)
- **Secondary emotions**: "reflective", "hopeful", "calm", "content"
- **Minor challenges**: "overwhelmed", "anxious" (showing authenticity)
- **Overall tone**: Balanced, authentic, hopeful, growth-oriented

## How to Run the Script

### Step 1: Create the Test Account (if not exists)
1. Sign up at your app with email: `coffeeappofficial@gmail.com`
2. Complete the onboarding flow
3. Note: The account must exist in `auth.users` before running the SQL script

### Step 2: Run the SQL Script
You have two options:

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `database/SEED_TEST_DATA_ORWELL.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**
7. You should see: "Successfully inserted 10 test journal entries for coffeeappofficial@gmail.com"

#### Option B: Via Command Line (if you have psql)
```bash
# From the project root
psql "YOUR_SUPABASE_CONNECTION_STRING" -f database/SEED_TEST_DATA_ORWELL.sql
```

### Step 3: Verify the Data
1. Log in as `coffeeappofficial@gmail.com`
2. Navigate to the Dashboard
3. You should see:
   - **Emotional landscape** with balanced emotions (mostly positive)
   - **10 journal entries** spanning the last 9 days
   - **Insights and patterns** showing growth themes

## What the Test Data Includes

### 10 Journal Entries (Most Recent First):
1. **Morning reflection** (Today) - Grateful, calm, confident
2. **Processing today** (Yesterday) - Overwhelmed → Hopeful (shows coping)
3. **Great evening with friends** (2 days ago) - Joyful, connected
4. **Learning from mistakes** (3 days ago) - Proud, growth mindset
5. **Navigating conflict** (4 days ago) - Anxious → Relieved (resolution)
6. **Finished the book!** (5 days ago) - Satisfied, accomplished
7. **Weekend thoughts** (6 days ago) - Peaceful, reflective
8. **New project kickoff** (1 week ago) - Excited, motivated
9. **Tough day but learning** (8 days ago) - Frustrated → Determined (insight)
10. **Simple pleasures** (9 days ago) - Grateful, peaceful

### Themes Covered:
- Self-care and mindfulness
- Work success and challenges
- Social connections
- Personal growth
- Conflict resolution
- Healthy habits
- Purpose and passion
- Self-compassion

## Taking Marketing Screenshots

### Best Screenshots for Marketing:
1. **Dashboard - Emotional Landscape**
   - Shows balanced emotions with "grateful" as most recurring
   - Demonstrates the app's pattern detection
   - Conveys hope and self-awareness

2. **Individual Entry View**
   - Use entries like "Morning reflection" or "Great evening with friends"
   - Shows how AI provides insights without being prescriptive
   - Demonstrates conversational, supportive tone

3. **Insights/Patterns Section**
   - Highlights growth themes and positive patterns
   - Shows the app tracking progress over time

### Marketing Message
The test data supports these key messages:
- ✅ "Understand your emotional patterns"
- ✅ "Track your growth and progress"
- ✅ "Find clarity in life's complexity"
- ✅ "Balance challenges with hope"
- ✅ "Build self-awareness through reflection"

## Updating the Test Data

To refresh or modify the test data:
1. Edit `database/SEED_TEST_DATA_ORWELL.sql`
2. The script automatically deletes existing entries before inserting new ones
3. Re-run the script following Step 2 above

## Notes
- The script is idempotent - safe to run multiple times
- All entries have realistic `ai_insights` JSON for proper dashboard display
- Timestamps are relative to NOW() so data always appears recent
- Emotional intensities are calibrated for visual balance in the UI
