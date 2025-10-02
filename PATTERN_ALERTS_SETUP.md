# Pattern Alerts Feature Setup Guide

This guide will help you set up the Pattern Alerts feature for your Insight AI App. The feature consists of three main parts: database setup, backend logic, and frontend UI.

## Part 1: Database Setup

### Step 1: Create the Pattern Alerts Table

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL script (found in `database/pattern_alerts_table.sql`):

```sql
-- Create the pattern_alerts table
CREATE TABLE IF NOT EXISTS pattern_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('THEME_STREAK', 'HISTORICAL_SIMILARITY', 'MOOD_PATTERN', 'TRIGGER_PATTERN')),
    alert_text TEXT NOT NULL,
    related_note_ids JSONB NOT NULL DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_user_id ON pattern_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_created_at ON pattern_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_is_read ON pattern_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_alert_type ON pattern_alerts(alert_type);

-- Enable Row Level Security (RLS)
ALTER TABLE pattern_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own alerts
CREATE POLICY "Users can view their own alerts" ON pattern_alerts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own alerts
CREATE POLICY "Users can insert their own alerts" ON pattern_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own alerts
CREATE POLICY "Users can update their own alerts" ON pattern_alerts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own alerts
CREATE POLICY "Users can delete their own alerts" ON pattern_alerts
    FOR DELETE USING (auth.uid() = user_id);
```

### Step 2: Verify Table Creation

1. Go to the Table Editor in your Supabase dashboard
2. You should see the new `pattern_alerts` table
3. Verify that the RLS policies are active

## Part 2: Backend Logic Integration

### Step 1: Trigger Pattern Detection

The pattern detection should be triggered after a note is saved and analyzed. You can integrate this in your existing AI analysis flow.

In your `aiService.ts` or wherever you handle AI analysis completion, add:

```typescript
import { PatternDetectionService } from './patternDetectionService';

// After AI analysis is complete and saved
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // Run pattern detection in the background
  PatternDetectionService.runPatternDetection(user.id).catch(console.error);
}
```

### Step 2: Manual Pattern Detection (Optional)

You can also create a manual trigger for testing:

```typescript
// In your AIAnalysis component or wherever appropriate
const triggerPatternDetection = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await PatternDetectionService.runPatternDetection(user.id);
    // Optionally refresh the alerts count
    const count = await PatternAlertsService.getUnreadCount(user.id);
    setUnreadAlertsCount(count);
  }
};
```

## Part 3: Frontend Integration

### Step 1: Verify Components

The following components have been created:

- `src/components/alerts/AlertsView.tsx` - Main alerts view
- `src/components/alerts/AlertCard.tsx` - Individual alert card
- `src/components/alerts/AlertsView.css` - Styling for alerts view
- `src/components/alerts/AlertCard.css` - Styling for alert cards
- `src/services/patternAlertsService.ts` - Service for managing alerts
- `src/services/patternDetectionService.ts` - Service for detecting patterns

### Step 2: Update App Component

The main App component has been updated to include:
- Alerts view routing
- Unread alerts count in sidebar
- Integration with the alerts system

### Step 3: Test the Feature

1. Create several diary entries with similar themes over consecutive days
2. Wait for AI analysis to complete
3. Check the Alerts button in the sidebar for notification count
4. Click on Alerts to view generated pattern alerts

## Part 4: Pattern Detection Types

The system currently detects four types of patterns:

### 1. Theme Streaks (`THEME_STREAK`)
- Detects when the same insight appears for 3+ consecutive days
- Example: "You've written about 'sleep issues' for 3 days in a row."

### 2. Mood Patterns (`MOOD_PATTERN`)
- Detects patterns of negative sentiment over 14 days
- Example: "You've experienced challenging thoughts in 5 out of the last 14 days."

### 3. Trigger Patterns (`TRIGGER_PATTERN`)
- Detects recurring triggers identified by AI analysis
- Example: "'Work stress' has been identified as a trigger in 2 recent entries."

### 4. Historical Similarity (`HISTORICAL_SIMILARITY`)
- Reserved for future implementation
- Could detect similar patterns to past challenging periods

## Part 5: Customization

### Adding New Pattern Types

1. Update the `AlertType` in `src/types/diary.ts`:
```typescript
export type AlertType = 'THEME_STREAK' | 'HISTORICAL_SIMILARITY' | 'MOOD_PATTERN' | 'TRIGGER_PATTERN' | 'YOUR_NEW_TYPE';
```

2. Add the new type to the database constraint:
```sql
ALTER TABLE pattern_alerts DROP CONSTRAINT pattern_alerts_alert_type_check;
ALTER TABLE pattern_alerts ADD CONSTRAINT pattern_alerts_alert_type_check 
  CHECK (alert_type IN ('THEME_STREAK', 'HISTORICAL_SIMILARITY', 'MOOD_PATTERN', 'TRIGGER_PATTERN', 'YOUR_NEW_TYPE'));
```

3. Create a new detection method in `PatternDetectionService`
4. Add the new type to the `runPatternDetection` method

### Styling Customization

The alerts use CSS custom properties that integrate with your existing theme system:
- `--primary-color` - Used for alert borders and buttons
- `--text-color` - Main text color
- `--text-secondary-color` - Secondary text color
- `--border-color` - Border colors
- `--card-background` - Card background color

## Part 6: Testing

### Manual Testing

1. **Create Test Data**: Write several entries with similar themes
2. **Trigger Analysis**: Ensure AI analysis runs on your entries
3. **Check Alerts**: Look for the bell icon in the sidebar
4. **View Alerts**: Click on Alerts to see generated patterns
5. **Interact**: Test marking alerts as read and deleting them

### Automated Testing (Future)

Consider adding unit tests for:
- Pattern detection algorithms
- Alert creation and management
- UI component interactions

## Troubleshooting

### Common Issues

1. **No alerts appearing**: Check that AI analysis is completing and the pattern detection is being triggered
2. **Database errors**: Verify that the table was created correctly and RLS policies are active
3. **Styling issues**: Ensure CSS custom properties are defined in your theme files

### Debug Mode

Enable debug logging by checking the browser console for:
- Pattern detection execution
- Alert creation attempts
- Database query results

## Next Steps

1. **Deploy the database changes** to your production environment
2. **Test the feature** with real user data
3. **Monitor performance** and adjust detection thresholds as needed
4. **Consider adding more pattern types** based on user feedback
5. **Implement real-time notifications** using Supabase subscriptions

The Pattern Alerts feature is now ready to help users identify recurring themes and patterns in their mental health journey! 