import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/core/supabaseServer';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    if (!/^\d{1,20}$/.test(userId)) {
      return NextResponse.json({ error: 'user_id must be numeric string' }, { status: 400 });
    }
    console.info('[check-teacher] user_id query:', userId);
    // Используем service_role, чтобы обойти RLS для проверки по telegram_id
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('telegram_id', userId);
    if (error) {
      console.error('[check-teacher] query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const exists = typeof count === 'number' ? count > 0 : false;
    console.info('[check-teacher] exists:', exists);
    return NextResponse.json({ exists });
  } catch {
    console.error('[check-teacher] invalid request');
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


