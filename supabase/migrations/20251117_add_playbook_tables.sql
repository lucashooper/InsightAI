-- =====================================================
-- CROSS-DEVICE SYNC: PLAYBOOK & PROTOCOLS MIGRATION
-- =====================================================
-- This migration moves actionable insights and daily protocols
-- from localStorage/AsyncStorage to Supabase for true cross-device sync
-- =====================================================

-- 1. ACTIONABLE INSIGHTS TABLE
-- Stores AI-suggested strategies and user-created strategies
CREATE TABLE IF NOT EXISTS actionable_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('coping', 'exercise', 'social', 'mindfulness', 'sleep', 'nutrition', 'general')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  emoji TEXT DEFAULT '✨',
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'active', 'completed', 'archived')),
  source TEXT NOT NULL DEFAULT 'user_created' CHECK (source IN ('ai_suggested', 'user_created')),
  source_entry_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  
  -- Timing
  estimated_time TEXT,
  
  -- User notes
  notes TEXT,
  
  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Indexes for fast queries
  CONSTRAINT actionable_insights_user_id_idx UNIQUE (user_id, id)
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_actionable_insights_user_id ON actionable_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_actionable_insights_status ON actionable_insights(user_id, status);
CREATE INDEX IF NOT EXISTS idx_actionable_insights_source ON actionable_insights(user_id, source);

-- RLS policies
ALTER TABLE actionable_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON actionable_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON actionable_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON actionable_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON actionable_insights FOR DELETE
  USING (auth.uid() = user_id);


-- 2. INSIGHT PROGRESS TABLE
-- Tracks attempts and effectiveness for each insight
CREATE TABLE IF NOT EXISTS insight_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id UUID NOT NULL REFERENCES actionable_insights(id) ON DELETE CASCADE,
  
  -- Progress tracking
  attempts INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  effectiveness DECIMAL(3,2) DEFAULT 0.00 CHECK (effectiveness >= 0 AND effectiveness <= 10),
  
  -- Dates
  last_attempt_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One progress record per insight per user
  CONSTRAINT insight_progress_unique UNIQUE (user_id, insight_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insight_progress_user_id ON insight_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_progress_insight_id ON insight_progress(insight_id);

-- RLS policies
ALTER TABLE insight_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON insight_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON insight_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON insight_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON insight_progress FOR DELETE
  USING (auth.uid() = user_id);


-- 3. INSIGHT PROGRESS NOTES TABLE
-- Stores user notes for each attempt
CREATE TABLE IF NOT EXISTS insight_progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_id UUID NOT NULL REFERENCES insight_progress(id) ON DELETE CASCADE,
  
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insight_progress_notes_progress_id ON insight_progress_notes(progress_id);

-- RLS policies
ALTER TABLE insight_progress_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress notes"
  ON insight_progress_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress notes"
  ON insight_progress_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress notes"
  ON insight_progress_notes FOR DELETE
  USING (auth.uid() = user_id);


-- 4. DAILY PROTOCOLS TABLE
-- Stores recurring daily habits
CREATE TABLE IF NOT EXISTS daily_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('morning', 'afternoon', 'evening', 'anytime')),
  emoji TEXT DEFAULT '⏰',
  
  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  reminder_time TIME,
  
  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_protocols_user_id ON daily_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_protocols_active ON daily_protocols(user_id, is_active);

-- RLS policies
ALTER TABLE daily_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own protocols"
  ON daily_protocols FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own protocols"
  ON daily_protocols FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own protocols"
  ON daily_protocols FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protocols"
  ON daily_protocols FOR DELETE
  USING (auth.uid() = user_id);


-- 5. DAILY COMPLETIONS TABLE
-- Tracks daily protocol completions
CREATE TABLE IF NOT EXISTS daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES daily_protocols(id) ON DELETE CASCADE,
  
  -- Completion data
  date DATE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One completion per protocol per day
  CONSTRAINT daily_completions_unique UNIQUE (user_id, protocol_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_id ON daily_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_protocol_id ON daily_completions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_date ON daily_completions(user_id, date);

-- RLS policies
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON daily_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
  ON daily_completions FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_daily_protocols_updated_at
  BEFORE UPDATE ON daily_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insight_progress_updated_at
  BEFORE UPDATE ON insight_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- After running this migration:
-- 1. Update actionableInsightsService.ts to use Supabase instead of localStorage
-- 2. Update dailyProtocolService.ts to use Supabase instead of localStorage
-- 3. Create a one-time migration script to move existing localStorage data to Supabase
-- 4. Update mobile PlaybookScreen to use Supabase instead of AsyncStorage
-- =====================================================
