-- Add user_email column to existing user_feedback table
ALTER TABLE public.user_feedback 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Update existing rows with a placeholder (you can manually update these later)
UPDATE public.user_feedback 
SET user_email = 'legacy@user.com' 
WHERE user_email IS NULL;

-- Make the column NOT NULL after updating existing rows
ALTER TABLE public.user_feedback 
ALTER COLUMN user_email SET NOT NULL;
