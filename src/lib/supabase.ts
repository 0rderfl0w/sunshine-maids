import { createBrowserClient, createServerClient } from '@supabase/ssr';

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
 * Creates a Supabase client for server-side usage in SSR routes.
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
      },
    },
  });
}
