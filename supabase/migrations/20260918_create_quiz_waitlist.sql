-- Web-to-app quiz waitlist (anonymous email capture)
CREATE TABLE IF NOT EXISTS public.quiz_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  goal TEXT,
  frequency TEXT,
  minutes TEXT,
  profile_label TEXT,
  profile_summary TEXT,
  source TEXT DEFAULT 'web_quiz',
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_waitlist_email ON public.quiz_waitlist (lower(email));
CREATE INDEX IF NOT EXISTS idx_quiz_waitlist_created_at ON public.quiz_waitlist (created_at DESC);

ALTER TABLE public.quiz_waitlist ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors can submit quiz emails
CREATE POLICY "Anyone can join quiz waitlist"
  ON public.quiz_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin can read waitlist entries
CREATE POLICY "Admin can view quiz waitlist"
  ON public.quiz_waitlist
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('edwardsjonny547@gmail.com', 'lucashooper100@outlook.com')
  );
