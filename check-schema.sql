-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_profiles', 'notes')
ORDER BY table_name;

-- Check the notes table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- Check foreign key constraints on notes table
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'notes' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Check if rwb44 exists in 'users' table (not user_profiles)
SELECT id, email FROM auth.users WHERE email = 'richardwilliamb@icloud.com';

-- Check user_profiles vs auth.users mismatch
SELECT 
  up.id as profile_id,
  up.email as profile_email,
  up.username,
  au.id as auth_id,
  au.email as auth_email
FROM user_profiles up
FULL OUTER JOIN auth.users au ON up.email = au.email
WHERE up.username = 'rwb44' OR au.email = 'richardwilliamb@icloud.com';
