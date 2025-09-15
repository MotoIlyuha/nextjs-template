import { NextResponse } from 'next/server';
import { validateInitData } from '@/lib/telegram/validateInitData';
import type { AuthResponse } from '@/types/auth';

export async function POST(request: Request): Promise<Response> {
  try {
    // Simple in-memory rate limit (per-process) by IP
    // Not bulletproof, but reduces accidental abuse in dev
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
    // @ts-ignore
    const g: any = globalThis as any;
    g.__rate ||= new Map<string, number[]>();
    const now = Date.now();
    const windowMs = 10_000; // 10s
    const limit = 8; // 8 req per 10s per IP
    const arr: number[] = g.__rate.get(ip) || [];
    const next = arr.filter((t) => now - t < windowMs);
    next.push(now);
    g.__rate.set(ip, next);
    if (next.length > limit) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body: unknown = await request.json();
    const initData =
      typeof body === 'object' && body !== null && 'initData' in body
        ? (body as { initData: unknown }).initData
        : undefined;

    if (typeof initData !== 'string' || initData.length === 0) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    const endpoint = process.env.SUPABASE_AUTH_TELEGRAM_URL;
    const secret = process.env.SUPABASE_AUTH_TELEGRAM_SECRET;

    if (!endpoint) {
      return NextResponse.json({ error: 'Supabase Edge Function URL is not configured' }, { status: 500 });
    }

    if (!secret) {
      return NextResponse.json({ error: 'Supabase Edge Function secret is not configured' }, { status: 500 });
    }

    let isValid: boolean;
    try {
      isValid = validateInitData(initData);
    } catch (e) {
      console.error('validateInitData failed:', e);
      return NextResponse.json({ error: 'Validation error' }, { status: 500 });
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const search = new URLSearchParams(initData);
    const userRaw = search.get('user');
    if (!userRaw) {
      return NextResponse.json({ error: 'user is missing in initData' }, { status: 400 });
    }

    type TelegramUser = {
      id: number;
      first_name: string;
      username?: string;
      photo_url?: string;
    };

    let user: TelegramUser;
    try {
      user = JSON.parse(userRaw) as TelegramUser;
    } catch (e) {
      console.error('Failed to parse user JSON from initData:', e);
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    if (typeof user?.id !== 'number' || typeof user?.first_name !== 'string') {
      return NextResponse.json({ error: 'Invalid user fields' }, { status: 400 });
    }

    const verifiedPayload = {
      user_id: String(user.id),
      first_name: user.first_name,
      username: user.username,
      photo_url: user.photo_url,
    } as const;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(verifiedPayload),
      cache: 'no-store',
    });

    let data: AuthResponse | { error?: string } = { } as AuthResponse;
    try {
      data = (await res.json()) as AuthResponse | { error?: string };
    } catch (e) {
      console.error('Failed to parse Edge Function response JSON:', e);
      return NextResponse.json({ error: 'Upstream response parse error' }, { status: 502 });
    }

    if (!res.ok) {
      const errorMessage = 'error' in data && data.error ? data.error : 'Auth failed';
      console.error('Edge Function error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    const ok = data as AuthResponse;
    console.info('[auth/telegram] login success for user_id:', verifiedPayload.user_id, 'name:', verifiedPayload.first_name);
    return NextResponse.json<AuthResponse>(ok, { status: 200 });
  } catch (error) {
    console.error('Unhandled error in Telegram auth route:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


