import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { MiddlewareNext } from 'astro:kit';

/**
 * Creates a Supabase client for browser/React island usage.
 * This client handles session management via cookies.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Creates a Supabase client for server-side usage.
 * Used in middleware and SSR routes.
 */
export function createServerSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  cookies: {
    get: (key: string) => string | undefined;
    set: (key: string, value: string, options?: any) => void;
  }
) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => {
        cookies.set(key, value, options);
      }
    }
  });
}

export { createServerClient };
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
