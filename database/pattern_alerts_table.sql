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

-- Create a function to automatically clean up old alerts (optional)
CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS void AS $$
BEGIN
    -- Delete alerts older than 30 days that have been read
    DELETE FROM pattern_alerts 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND is_read = true;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (optional - requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-alerts', '0 2 * * *', 'SELECT cleanup_old_alerts();'); 