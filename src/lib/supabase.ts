import { createBrowserClient } from '@supabase/ssr';

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
