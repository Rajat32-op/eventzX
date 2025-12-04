-- Create meetup_comments table
CREATE TABLE IF NOT EXISTS meetup_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetup_comments_meetup_id ON meetup_comments(meetup_id);
CREATE INDEX IF NOT EXISTS idx_meetup_comments_user_id ON meetup_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_meetup_comments_created_at ON meetup_comments(created_at DESC);

-- Enable RLS
ALTER TABLE meetup_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read comments
CREATE POLICY "Anyone can read comments"
  ON meetup_comments
  FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON meetup_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON meetup_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON meetup_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
