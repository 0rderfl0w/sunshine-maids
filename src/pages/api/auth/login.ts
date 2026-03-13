// Login API endpoint - SSR
export const prerender = false;

import { createServerClient } from '@supabase/ssr';
import type { APIContext } from 'astro';

export const POST = async ({ cookies, redirect, request }: APIContext) => {
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

  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return redirect('/admin/login?error=missing');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    console.error('Login error:', error?.message);
    return redirect('/admin/login?error=invalid');
  }

  return redirect('/admin/dashboard');
};
