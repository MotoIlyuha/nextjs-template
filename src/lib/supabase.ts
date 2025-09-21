import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let browserClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Creates or returns a cached Supabase browser client typed with our Database.
 */
export function createClient() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    if (!url || !anon) {
      throw new Error('Supabase env vars are missing');
    }
    browserClient = createSupabaseClient<Database>(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return browserClient;
}


