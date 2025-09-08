import type { Session } from '@supabase/supabase-js';
import { getSupabase } from './init';

export async function setSupabaseSession(session: Session): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) throw error;
}


