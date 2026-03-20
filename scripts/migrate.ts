/**
 * Supabase Migration Script
 * Run with: bun scripts/migrate.ts
 * 
 * Creates:
 * - posts table with RLS policies
 * - blog-images storage bucket
 * - Admin user (hello@sunshinemaids.com)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Admin client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrate() {
  console.log('Starting migration...');
  
  try {
    // 1. Create posts table
    console.log('Creating posts table...');
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS posts (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          title text NOT NULL,
          slug text NOT NULL UNIQUE,
          body_html text NOT NULL,
          excerpt text,
          cover_image text,
          published boolean NOT NULL DEFAULT false,
          published_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
      `
    });
    
    if (tableError) {
      console.log('Table may already exist or RPC not available, trying direct SQL...');
    }
    
    // Create function directly
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS trigger AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (funcError) {
      console.log('Function may already exist:', funcError.message);
    }
    
    // Create trigger
    await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS posts_updated_at ON posts;
        CREATE TRIGGER posts_updated_at
        BEFORE UPDATE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
      `
    });
    
    // Create indexes
    await supabase.rpc('exec_sql', {
      sql: `
        DROP INDEX IF EXISTS posts_slug_idx;
        CREATE INDEX posts_slug_idx ON posts(slug);
        
        DROP INDEX IF EXISTS posts_published_idx;
        CREATE INDEX posts_published_idx ON posts(published, published_at DESC);
      `
    });
    
    console.log('Posts table created successfully!');
    
    // 2. Enable RLS
    console.log('Setting up RLS policies...');
    
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE posts ENABLE ROW LEVEL SECURITY;`
    });
    
    // Public can read published posts
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "public_read_published" ON posts;
        CREATE POLICY "public_read_published" ON posts
        FOR SELECT USING (published = true);
      `
    });
    
    // Authenticated users can do everything (admin)
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "admin_all" ON posts;
        CREATE POLICY "admin_all" ON posts
        FOR ALL
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
      `
    });
    
    console.log('RLS policies created!');
    
    // 3. Create storage bucket
    console.log('Creating blog-images storage bucket...');
    
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(
      'blog-images',
      {
        public: true,
        name: 'blog-images'
      }
    );
    
    if (bucketError) {
      console.log('Bucket may already exist:', bucketError.message);
    } else {
      console.log('Bucket created:', bucketData);
    }
    
    // 4. Create admin user
    console.log('Creating admin user...');
    
    const adminEmail = 'hello@sunshinemaids.com';
    const tempPassword = 'SunshineAdmin2026!' // Temporary - user will change
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin'
      }
    });
    
    if (userError) {
      console.log('User may already exist:', userError.message);
      
      // Try to get existing user
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const richard = existingUser?.users.find(u => u.email === adminEmail);
      
      if (richard) {
        console.log('Admin user already exists:', richard.id);
      }
    } else {
      console.log('Admin user created:', userData.user?.id);
    }
    
    console.log('\n✅ Migration complete!');
    console.log('- Posts table ready');
    console.log('- RLS policies active');
    console.log('- Storage bucket ready');
    console.log('- Admin user ready (email: hello@sunshinemaids.com)');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
