-- Force PostgREST to reload the schema cache
-- Run this to refresh the API schema after adding the tasks column

NOTIFY pgrst, 'reload schema';

-- Alternative: You can also restart your Supabase project
-- Go to: Settings → Database → Restart database

-- Verify the tasks column is accessible via the API
-- After running this, test creating a strategy with tasks again
