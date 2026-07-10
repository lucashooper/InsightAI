-- Check-ins: structured emotional data from the guided check-in flow
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score int NOT NULL CHECK (mood_score BETWEEN 1 AND 7),
  mood_label text NOT NULL,
  feelings text[] DEFAULT '{}',
  with_who text[] DEFAULT '{}',
  where_at text[] DEFAULT '{}',
  doing text[] DEFAULT '{}',
  journal_title text,
  journal_body text,
  journal_note_id uuid REFERENCES notes(id) ON DELETE SET NULL,
  ai_summary text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS check_ins_user_id_created_at_idx
  ON check_ins (user_id, created_at DESC);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own check_ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check_ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check_ins"
  ON check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- Per-user custom context tags (who / where / doing)
CREATE TABLE IF NOT EXISTS user_custom_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('who', 'where', 'doing')),
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, category, tag)
);

CREATE INDEX IF NOT EXISTS user_custom_tags_user_category_idx
  ON user_custom_tags (user_id, category);

ALTER TABLE user_custom_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own custom tags"
  ON user_custom_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom tags"
  ON user_custom_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom tags"
  ON user_custom_tags FOR DELETE
  USING (auth.uid() = user_id);
