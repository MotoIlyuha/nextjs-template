import { NextResponse } from 'next/server';

interface RegisterBody {
  user: {
    id: number;
    first_name?: string;
    username?: string;
    photo_url?: string;
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const raw = await request.text();
    let body: RegisterBody;
    try {
      body = JSON.parse(raw) as RegisterBody;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'JSON parse error';
      return NextResponse.json({ error: `Invalid JSON: ${msg}` }, { status: 400 });
    }

    const user = body?.user;
    if (!user?.id) {
      return NextResponse.json({ error: 'user.id is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const edgeSecret = process.env.EDGE_AUTH_TELEGRAM_SECRET;
    if (!baseUrl || !edgeSecret) {
      return NextResponse.json({ error: 'Server env is not configured' }, { status: 500 });
    }

    const url = `${baseUrl}/functions/v1/telegram-auth`;

    const edgeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${edgeSecret}`,
      },
      body: JSON.stringify({
        user_id: String(user.id),
        first_name: user.first_name ?? String(user.id),
        username: user.username ?? undefined,
        photo_url: user.photo_url ?? undefined,
      }),
    });

    const json = await edgeResponse.json();
    if (!edgeResponse.ok) {
      const message = (json?.error as string) || 'Edge auth failed';
      return NextResponse.json({ error: message }, { status: edgeResponse.status });
    }

    // Expecting { user, session } from edge function
    return NextResponse.json(json);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


