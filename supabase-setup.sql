-- Create likes table for blog posts and photos
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'photo')),
  content_id TEXT NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(content_type, content_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_content ON likes(content_type, content_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read likes
CREATE POLICY "Allow public read access" ON likes
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert/update likes
CREATE POLICY "Allow public insert/update access" ON likes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to increment likes atomically
CREATE OR REPLACE FUNCTION increment_likes(p_content_type TEXT, p_content_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  INSERT INTO likes (content_type, content_id, count)
  VALUES (p_content_type, p_content_id, 1)
  ON CONFLICT (content_type, content_id)
  DO UPDATE SET
    count = likes.count + 1,
    updated_at = TIMEZONE('utc', NOW())
  RETURNING count INTO current_count;

  RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get likes count
CREATE OR REPLACE FUNCTION get_likes_count(p_content_type TEXT, p_content_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT count INTO current_count
  FROM likes
  WHERE content_type = p_content_type AND content_id = p_content_id;

  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
