# AI Chat Rate Limiting Implementation Guide

## Overview
To prevent excessive API costs from AI Chat usage, implement daily message limits.

## Recommended Limits
- **Free Users**: 50 messages per day
- **Pro Users**: Unlimited messages
- **Reset**: Daily at midnight UTC

## Implementation Steps

### 1. Create Supabase Table
```sql
CREATE TABLE ai_chat_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for fast lookups
CREATE INDEX idx_ai_chat_usage_user_date ON ai_chat_usage(user_id, date);

-- RLS Policies
ALTER TABLE ai_chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON ai_chat_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON ai_chat_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON ai_chat_usage FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2. Update AIChatScreen.tsx

Add at the top of the file:
```typescript
const FREE_USER_DAILY_LIMIT = 50;

// Add state
const [dailyMessageCount, setDailyMessageCount] = useState(0);
const [isProUser, setIsProUser] = useState(false);
```

Add function to check/update usage:
```typescript
const checkAndUpdateUsage = async (): Promise<boolean> => {
  try {
    if (!user) return false;
    
    // Check if user is Pro
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();
    
    const isPro = profile?.subscription_tier === 'pro';
    setIsProUser(isPro);
    
    // Pro users have unlimited messages
    if (isPro) return true;
    
    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error } = await supabase
      .from('ai_chat_usage')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking usage:', error);
      return false;
    }
    
    const currentCount = usage?.message_count || 0;
    setDailyMessageCount(currentCount);
    
    // Check if limit reached
    if (currentCount >= FREE_USER_DAILY_LIMIT) {
      Alert.alert(
        'Daily Limit Reached',
        `You've reached your daily limit of ${FREE_USER_DAILY_LIMIT} messages. Upgrade to Insight Pro for unlimited AI conversations!`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade to Pro', onPress: () => navigation.navigate('Paywall') }
        ]
      );
      return false;
    }
    
    // Increment usage
    if (usage) {
      await supabase
        .from('ai_chat_usage')
        .update({ message_count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('date', today);
    } else {
      await supabase
        .from('ai_chat_usage')
        .insert({ user_id: user.id, date: today, message_count: 1 });
    }
    
    setDailyMessageCount(currentCount + 1);
    return true;
    
  } catch (error) {
    console.error('Error in checkAndUpdateUsage:', error);
    return false;
  }
};
```

Update sendMessage function:
```typescript
const sendMessage = useCallback(async (text?: string) => {
  const messageText = (text || inputText).trim();
  if (!messageText || isLoading) return;
  
  // CHECK RATE LIMIT BEFORE SENDING
  const canSend = await checkAndUpdateUsage();
  if (!canSend) return;
  
  // ... rest of existing code
}, [inputText, isLoading, messages, personality, user]);
```

Add usage indicator in UI (in the header or input area):
```typescript
{!isProUser && (
  <View style={styles.usageIndicator}>
    <Text style={styles.usageText}>
      {dailyMessageCount}/{FREE_USER_DAILY_LIMIT} messages today
    </Text>
  </View>
)}
```

### 3. Load Usage on Mount
```typescript
useEffect(() => {
  if (user) {
    checkAndUpdateUsage();
  }
}, [user]);
```

## Testing
1. Test with free user account - should stop at 50 messages
2. Test with Pro user account - should have unlimited messages
3. Test that count resets daily
4. Test upgrade flow when limit is reached

## Cost Estimation
- Average AI message cost: ~$0.002-0.005 per message
- 50 messages/day = ~$0.10-0.25 per user per day
- With 1000 active free users = $100-250/day maximum
- Pro users generate revenue to offset their unlimited usage
