import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabaseAnon } from '@/core/supabaseServer';

interface RegisterBody {
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    console.info('[register-teacher] headers content-type:', contentType);
    if (!contentType.includes('application/json')) {
      console.error('[register-teacher] invalid content-type');
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const raw = await request.text();
    console.info('[register-teacher] raw length:', raw.length);
    let body: RegisterBody;
    try {
      body = JSON.parse(raw) as RegisterBody;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'JSON parse error';
      console.error('[register-teacher] json parse error:', msg);
      return NextResponse.json({ error: `Invalid JSON: ${msg}` }, { status: 400 });
    }
    const user = body?.user;
    if (!user?.id) {
      return NextResponse.json({ error: 'user.id is required' }, { status: 400 });
    }
    console.info('[register-teacher] start for telegram_id:', user.id);

    const supabase = getSupabaseAdmin();

    const email = `${user.id}@telegram.local`;
    const password = `telegram-${user.id}-${Date.now()}`; // одноразовый

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
      },
    });
    if (createError || !created.user) {
      console.error('[register-teacher] createUser error:', createError?.message);
      return NextResponse.json({ error: createError?.message || 'createUser failed' }, { status: 500 });
    }
    console.info('[register-teacher] user created:', created.user.id);

    const userRow = {
      id: created.user.id,
      telegram_id: user.id,
      first_name: user.first_name ?? null,
      last_name: user.last_name ?? null,
      username: user.username ?? null,
      photo_url: user.photo_url ?? null,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('users')
      .upsert(userRow, { onConflict: 'id' });
    if (insertError) {
      console.error('[register-teacher] insert users error:', insertError.message);
      // откат учётки, чтобы не оставлять "битого" пользователя
      try {
        await supabase.auth.admin.deleteUser(created.user.id);
      } catch (e) {
        console.error('[register-teacher] rollback deleteUser failed:', (e as Error)?.message);
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    console.info('[register-teacher] profile inserted for:', created.user.id);

    const anon = getSupabaseAnon();
    const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !signInData?.session) {
      console.error('[register-teacher] signIn error:', signInError?.message);
      return NextResponse.json({ error: signInError?.message || 'signIn failed' }, { status: 500 });
    }

    console.info('[register-teacher] success, returning session for:', created.user.id);
    return NextResponse.json({ session: signInData.session });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[register-teacher] exception:', message);
    const status = message.includes('env vars') ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}


