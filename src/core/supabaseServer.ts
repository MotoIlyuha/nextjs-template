import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !serviceKey) {
    throw new Error('Supabase admin env vars are missing');
  }
  console.info('[supabaseServer] Creating admin client');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export function getSupabaseAnon(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    throw new Error('Supabase anon env vars are missing');
  }
  console.info('[supabaseServer] Creating anon client');
  return createClient(url, anon, { auth: { persistSession: false } });
}


