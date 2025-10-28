-- Find who owns the notes that rwb44 is seeing
SELECT 
  up.username,
  up.email,
  up.id as user_id,
  up.created_at as account_created
FROM user_profiles up
WHERE up.id IN (
  '135862eb-0cfd-45ab-b3a4-9c0866333cbe',
  '8fa9b5be-12cc-4654-abaf-6395836d10de'
);

-- Check if these user_ids exist in user_profiles at all
SELECT 
  n.id,
  n.user_id,
  n.title,
  up.username,
  up.email,
  CASE 
    WHEN up.id IS NULL THEN 'ORPHANED - No user profile exists!'
    ELSE 'Has valid user profile'
  END as status
FROM notes n
LEFT JOIN user_profiles up ON n.user_id = up.id
WHERE n.user_id IN (
  '135862eb-0cfd-45ab-b3a4-9c0866333cbe',
  '8fa9b5be-12cc-4654-abaf-6395836d10de'
)
ORDER BY n.updated_at DESC;
