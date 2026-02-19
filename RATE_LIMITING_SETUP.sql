-- ============================================
-- AI Chat Rate Limiting Setup
-- ============================================
-- This SQL creates the necessary table and policies for tracking
-- AI chat usage to implement daily message limits.

-- Create the ai_chat_usage table
CREATE TABLE IF NOT EXISTS ai_chat_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_ai_chat_usage_user_date ON ai_chat_usage(user_id, date);

-- Enable Row Level Security
ALTER TABLE ai_chat_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-runs)
DROP POLICY IF EXISTS "Users can view their own usage" ON ai_chat_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON ai_chat_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON ai_chat_usage;

-- RLS Policy: Users can view their own usage
CREATE POLICY "Users can view their own usage"
  ON ai_chat_usage FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own usage
CREATE POLICY "Users can insert their own usage"
  ON ai_chat_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own usage
CREATE POLICY "Users can update their own usage"
  ON ai_chat_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Optional: Create a function to automatically clean up old usage records (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_chat_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_chat_usage
  WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: You can set up a cron job to run this cleanup function daily
-- This requires the pg_cron extension (uncomment if you have it enabled)
-- SELECT cron.schedule('cleanup-ai-chat-usage', '0 0 * * *', 'SELECT cleanup_old_ai_chat_usage()');

-- Verify the table was created successfully
SELECT 'ai_chat_usage table created successfully!' AS status;
