-- Create feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admin can view all feedback
CREATE POLICY "Admin can view all feedback"
  ON public.user_feedback
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'edwardsjonny547@gmail.com'
  );

-- Policy: Admin can update all feedback (mark as read/resolved)
CREATE POLICY "Admin can update all feedback"
  ON public.user_feedback
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'edwardsjonny547@gmail.com'
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
