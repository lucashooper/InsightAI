-- Verify if tasks column exists in actionable_insights table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'actionable_insights' 
AND column_name = 'tasks';

-- If it doesn't exist, create it
ALTER TABLE actionable_insights
ADD COLUMN IF NOT EXISTS tasks TEXT[] DEFAULT '{}';

-- Verify all columns in the table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'actionable_insights'
ORDER BY ordinal_position;
