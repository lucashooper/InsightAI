-- Test inserting a record with tasks to verify the column works
-- Replace the user_id with your actual user ID

INSERT INTO actionable_insights (
  user_id,
  title,
  description,
  category,
  difficulty,
  emoji,
  status,
  source,
  tasks
) VALUES (
  '9b05a525-4569-4f4f-ba49-69b84abb1d16', -- Your user ID from the terminal logs
  'Test Strategy with Tasks',
  'This is a test to verify tasks column works',
  'general',
  'moderate',
  '🧪',
  'active',
  'user_created',
  ARRAY['Task 1', 'Task 2', 'Task 3']::text[]
);

-- Verify it was inserted
SELECT id, title, tasks FROM actionable_insights 
WHERE title = 'Test Strategy with Tasks';

-- Clean up test data (run after verifying)
-- DELETE FROM actionable_insights WHERE title = 'Test Strategy with Tasks';
