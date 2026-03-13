-- Guardian Cleaners - Supabase Database Setup
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  body_html text NOT NULL DEFAULT '',
  excerpt text,
  cover_image text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published, published_at DESC);

-- 5. Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 6. Public read policy
DROP POLICY IF EXISTS "public_read_published" ON posts;
CREATE POLICY "public_read_published" ON posts
FOR SELECT USING (published = true);

-- 7. Admin policy
DROP POLICY IF EXISTS "admin_all" ON posts;
CREATE POLICY "admin_all" ON posts
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 8. Storage bucket (already created via API, but ensure policies exist)
-- Storage policies will be created automatically if bucket exists

-- 9. Verify
SELECT * FROM posts LIMIT 0;
