import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<Response> {
  try {
    const { initData } = await request.json();

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const endpoint = process.env.SUPABASE_AUTH_TELEGRAM_URL;
    const secret = process.env.SUPABASE_AUTH_TELEGRAM_SECRET;

    if (!endpoint) {
      return NextResponse.json({ error: 'Supabase Edge Function URL is not configured' }, { status: 500 });
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ initData }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ error: data?.error || 'Auth failed' }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


