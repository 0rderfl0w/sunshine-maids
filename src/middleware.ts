import { createServerClient } from '@supabase/ssr';
import type { MiddlewareNext } from 'astro:kit';

export const onRequest = async (context, next: MiddlewareNext) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Skip Supabase initialization if credentials are not available (build time)
  if (!supabaseUrl || !supabaseKey) {
    return next();
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get: (key) => context.cookies.get(key)?.value,
        set: (key, value, options) => {
          context.cookies.set(key, value, options);
        }
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Pass Supabase client via context.locals for SSR routes
  context.locals.supabase = supabase;
  context.locals.session = session;

  // Auth guard for /admin/* routes
  if (context.url.pathname.startsWith('/admin') && context.url.pathname !== '/admin/login') {
    if (!session) {
      return context.redirect('/admin/login');
    }
  }

  return next();
};
