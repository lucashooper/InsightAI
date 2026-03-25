-- Fix profile-pictures bucket permissions
-- Run this in your Supabase SQL Editor

-- 1. Check if bucket exists and is public
SELECT id, name, public 
FROM storage.buckets 
WHERE name = 'profile-pictures';

-- 2. Make the bucket public if it isn't already
UPDATE storage.buckets 
SET public = true 
WHERE name = 'profile-pictures';

-- 3. Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-pictures' );

-- 4. Create a policy to allow authenticated users to upload their own profile pictures
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Create a policy to allow authenticated users to update their own profile pictures
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Create a policy to allow authenticated users to delete their own profile pictures
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Verify the policies were created
SELECT * 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
