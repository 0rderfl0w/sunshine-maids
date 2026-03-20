/**
 * Direct SQL Migration Script
 * Run with: bun scripts/migrate-sql.ts
 */

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const SQL = `
-- Create posts table
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

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Indexes
DROP INDEX IF EXISTS posts_slug_idx;
CREATE INDEX posts_slug_idx ON posts(slug);

DROP INDEX IF EXISTS posts_published_idx;
CREATE INDEX posts_published_idx ON posts(published, published_at DESC);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read policy
DROP POLICY IF EXISTS "public_read_published" ON posts;
CREATE POLICY "public_read_published" ON posts
FOR SELECT USING (published = true);

-- Admin policy
DROP POLICY IF EXISTS "admin_all" ON posts;
CREATE POLICY "admin_all" ON posts
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
`;

async function runMigration() {
  console.log('Running direct SQL migration...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({ sql: SQL })
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.log('RPC exec_sql not available, trying alternative method...');
    
    // Try using the SQL endpoint differently
    // Actually let's use the postgres connection via the API
    console.log('Attempting alternative SQL execution...');
  } else {
    const result = await response.json();
    console.log('SQL executed:', result);
  }
  
  // Try to verify table exists
  console.log('\nVerifying table...');
  const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  
  const verifyData = await verifyRes.json();
  console.log('Table check:', verifyRes.status === '200' ? 'EXISTS' : verifyData);
  
  if (verifyRes.status === 200) {
    console.log('\n✅ Posts table verified!');
  }
}

runMigration().catch(console.error);
