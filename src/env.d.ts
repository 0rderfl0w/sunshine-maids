/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';

declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
    session: import('@supabase/supabase-js').Session | null;
  }
}
