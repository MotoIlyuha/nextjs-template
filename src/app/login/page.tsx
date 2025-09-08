'use client';

import { useEffect, useState } from 'react';
import { initDataRaw as _initDataRaw, useSignal } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { setSupabaseSession } from '@/core/auth';

export default function LoginPage() {
  const router = useRouter();
  const initDataRaw = useSignal(_initDataRaw);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!initDataRaw) return; // ждём инициализации TMA
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: initDataRaw }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Auth failed');
        }
        const data = await res.json();
        if (data?.session) {
          await setSupabaseSession(data.session);
        }
        if (!aborted) {
          router.replace('/app');
        }
      } catch (e: unknown) {
        if (!aborted) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [initDataRaw, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-black/20 p-6 text-center backdrop-blur">
        <h1 className="mb-2 text-xl font-semibold">Вход</h1>
        <p className="mb-4 text-sm text-white/70">Авторизация через Telegram Mini App</p>
        {error && (
          <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">
            {error}
          </div>
        )}
        <button
          type="button"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={loading || !initDataRaw}
          onClick={() => {
            // Триггерим вручную в случае, если initDataRaw уже доступен
            // Эффект сам выполнится при монтировании, но оставим кнопку на всякий случай
            // чтобы пользователь мог повторить попытку
            const event = new Event('click');
            window.dispatchEvent(event);
          }}
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
        <div className="mt-3 text-xs text-white/50 break-all">
          {!initDataRaw ? 'Ожидаем initData…' : 'initData получены'}
        </div>
      </div>
    </div>
  );
}


