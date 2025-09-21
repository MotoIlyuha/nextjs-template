'use client';

import { setSupabaseSession } from '@/core/auth';

export async function loginWithInitData(initDataRaw: string): Promise<void> {
  const res = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: initDataRaw }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Auth failed');
  if (data?.session) await setSupabaseSession(data.session);
}


