export const prerender = false;

import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';

export async function POST(context: APIContext) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return context.redirect('/admin/business-info?error=1');
  }

  // Get form data
  const formData = await context.request.formData();
  
  const fields = ['phone', 'email', 'address', 'business_hours', 'service_areas'];
  const updates = fields.map(key => ({
    key,
    value: formData.get(key)?.toString() || ''
  }));

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert each config value
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('site_config')
        .upsert({
          key: update.key,
          value: update.value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error(`Error updating ${update.key}:`, error);
        return context.redirect('/admin/business-info?error=1');
      }
    }

    return context.redirect('/admin/business-info?saved=1');
  } catch (e) {
    console.error('Exception saving business info:', e);
    return context.redirect('/admin/business-info?error=1');
  }
}