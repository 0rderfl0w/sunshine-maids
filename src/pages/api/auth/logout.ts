// Logout API endpoint - SSR
export const prerender = false;

import { createServerClient } from '@supabase/ssr';
import type { APIContext } from 'astro';

export const GET = async ({ cookies, redirect }: APIContext) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => {
          cookies.set(key, value, options);
        },
        remove: (key, options) => {
          cookies.delete(key, options);
        }
      }
    }
  );

  await supabase.auth.signOut();

  return redirect('/admin/login');
};
