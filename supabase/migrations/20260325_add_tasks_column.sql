-- Add tasks column to actionable_insights table
-- This allows protocols/strategies to have a list of tasks

ALTER TABLE actionable_insights
ADD COLUMN IF NOT EXISTS tasks TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN actionable_insights.tasks IS 'Array of task strings for task-based protocols';
