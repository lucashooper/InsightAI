-- Check notes table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;
