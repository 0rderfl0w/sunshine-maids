/**
 * SQL Migration via Supabase Direct Client
 * This uses pg client directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://cmpdoonysjbnjlykwwyg.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use the anon key for pg client but with service role for auth
const supabase = createClient(supabaseUrl, serviceKey);

const migrations = [
  // Migration 1: Create posts table
  `CREATE TABLE IF NOT EXISTS posts (
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
  )`,
  
  // Migration 2: Create trigger function
  `CREATE OR REPLACE FUNCTION set_updated_at()
   RETURNS trigger AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,
  
  // Migration 3: Create trigger
  `DROP TRIGGER IF EXISTS posts_updated_at ON posts;
   CREATE TRIGGER posts_updated_at
   BEFORE UPDATE ON posts
   FOR EACH ROW
   EXECUTE FUNCTION set_updated_at()`,
  
  // Migration 4: Create indexes
  `CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug)`,
  `CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published, published_at DESC)`,
  
  // Migration 5: Enable RLS
  `ALTER TABLE posts ENABLE ROW LEVEL SECURITY`,
  
  // Migration 6: Public read policy
  `DROP POLICY IF EXISTS "public_read_published" ON posts;
   CREATE POLICY "public_read_published" ON posts
   FOR SELECT USING (published = true)`,
   
  // Migration 7: Admin policy
  `DROP POLICY IF EXISTS "admin_all" ON posts;
   CREATE POLICY "admin_all" ON posts
   FOR ALL
   USING (auth.role() = 'authenticated')
   WITH CHECK (auth.role() = 'authenticated')`
];

async function runMigrations() {
  console.log('Running migrations...\n');
  
  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    console.log(`Migration ${i + 1}: ${sql.substring(0, 50)}...`);
    
    try {
      // Try using rpc to execute - but we need a function first
      // Instead, let's try inserting to test if table exists
      if (sql.includes('CREATE TABLE')) {
        // Try direct table check
        const { error } = await supabase
          .from('posts')
          .select('id')
          .limit(0);
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist - we need another way
          console.log('Table does not exist, need alternative method');
        } else if (!error || error.code === 'PGRST204') {
          // Table exists or schema cache issue
          console.log('  -> May already exist or cache issue');
        }
      }
    } catch (e) {
      console.log('  Error:', e.message);
    }
  }
  
  // Alternative: Use the Supabase client with a workaround
  // Actually, let's try using the REST API directly with a SQL endpoint
  console.log('\nTrying direct REST API approach...');
  
  // This won't work because PostgREST doesn't execute arbitrary SQL
  // We need a different approach
  
  console.log('\n⚠️  The Supabase JS client cannot execute raw SQL statements.');
  console.log('Please run the following SQL in the Supabase Dashboard SQL Editor:\n');
  
  console.log(`
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
  `);
}

runMigrations().catch(console.error);
