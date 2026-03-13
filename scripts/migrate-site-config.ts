/**
 * Site Config Migration Script
 * Run with: bun --env-file=.env scripts/migrate-site-config.ts
 * 
 * Creates:
 * - site_config table for business info
 * - RLS policies
 * - Initial seed data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  console.log('Starting site_config migration...');
  
  try {
    // 1. Create site_config table
    console.log('Creating site_config table...');
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS site_config (
          key text PRIMARY KEY,
          value text NOT NULL,
          updated_at timestamptz DEFAULT now()
        );
      `
    });
    
    if (tableError) {
      console.log('Table may already exist or RPC error:', tableError.message);
    } else {
      console.log('Table created successfully!');
    }
    
    // 2. Enable RLS
    console.log('Setting up RLS policies...');
    
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;`
    });
    
    // Public can read all config
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "public_read_site_config" ON site_config;
        CREATE POLICY "public_read_site_config" ON site_config
        FOR SELECT USING (true);
      `
    });
    
    // Authenticated users can write (admin)
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "admin_all_site_config" ON site_config;
        CREATE POLICY "admin_all_site_config" ON site_config
        FOR ALL
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
      `
    });
    
    console.log('RLS policies created!');
    
    // 3. Seed initial values
    console.log('Seeding initial values...');
    
    const seedData = [
      { key: 'phone', value: '(405) 977-4237' },
      { key: 'email', value: 'nick@guardian-cleaners.com' },
      { key: 'address', value: '4800 N Lincoln Blvd, Oklahoma City, OK 73105' },
      { key: 'business_hours', value: 'Mon-Fri 8am-6pm, Sat 9am-4pm' },
      { key: 'service_areas', value: 'Oklahoma City, Edmond, Norman, Yukon, Mustang, Moore, Midwest City, Del City, Choctaw, Nichols Hills' }
    ];
    
    for (const item of seedData) {
      const { error: upsertError } = await supabase
        .from('site_config')
        .upsert(item, { onConflict: 'key' });
      
      if (upsertError) {
        console.log(`Warning: Could not upsert ${item.key}:`, upsertError.message);
      }
    }
    
    console.log('Seed data inserted!');
    
    // Verify
    const { data: configData } = await supabase
      .from('site_config')
      .select('key, value');
    
    console.log('\n✅ Site config migration complete!');
    console.log('Current config:');
    configData?.forEach(item => {
      console.log(`  - ${item.key}: ${item.value}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();