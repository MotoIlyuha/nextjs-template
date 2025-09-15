'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { loginWithInitData } from '@/core/telegramAuth';

export default function RootPage() {
  const router = useRouter();
  const initData = useSignal(_initDataState);
  const initDataRaw = useSignal(_initDataRaw);
  const [error, setError] = useState<string | null>(null);

  const telegramUserId: string | null = useMemo(() => {
    const id = initData?.user?.id;
    return typeof id === 'number' ? String(id) : id ? String(id) : null;
  }, [initData?.user?.id]);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!initDataRaw) return; // ждём initData
      try {
        setError(null);
        // Шаг 1: проверка наличия профиля в teachers по telegram_id
        if (!telegramUserId) {
          if (!aborted) router.replace('/onboarding');
          return;
        }
        const checkRes = await fetch(`/api/check-teacher?user_id=${telegramUserId}`, { cache: 'no-store' });
        const checkData = await checkRes.json().catch(() => ({}));
        const exists: boolean = Boolean(checkData?.exists);

        if (!exists) {
          // Новый пользователь — показываем onboarding, без создания сессии
          if (!aborted) router.replace('/onboarding');
          return;
        }

        // Шаг 2: пользователь существует — выполняем авторизацию и переходим в приложение
        await loginWithInitData(initDataRaw);
        if (!aborted) router.replace('/app');
      } catch (e: unknown) {
        if (!aborted) {
          setError(e instanceof Error ? e.message : 'Unknown error');
          // При ошибке — отправляем на /login как fallback
          router.replace('/login');
        }
      }
    }
    run();
    return () => {
      aborted = true;
    };
  }, [initDataRaw, telegramUserId, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 text-sm text-white/70">
      {error ? `Ошибка входа: ${error}` : 'Вход в систему…'}
    </div>
  );
}


