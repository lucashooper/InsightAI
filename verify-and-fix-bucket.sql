-- Step 1: Check current bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'profile-pictures';

-- Step 2: Make bucket public (CRITICAL - this is likely the issue)
UPDATE storage.buckets 
SET public = true 
WHERE name = 'profile-pictures';

-- Step 3: Verify bucket is now public
SELECT id, name, public 
FROM storage.buckets 
WHERE name = 'profile-pictures';

-- Step 4: Check if there are any CORS issues - view bucket configuration
SELECT * FROM storage.buckets WHERE name = 'profile-pictures';
