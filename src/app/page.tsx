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
      // Если приложение запускается вне Telegram, показываем сообщение
      if (!initDataRaw) {
        // Ждем 3 секунды, если initData не пришел, показываем fallback
        const timer = setTimeout(() => {
          if (!aborted && !initDataRaw) {
            setError('Приложение должно запускаться в Telegram Mini App');
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
      
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
        if (!aborted) router.replace('/students');
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
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-400 text-sm">
              {error}
            </div>
            <div className="text-white/70 text-xs space-y-2">
              <p>Это приложение предназначено для работы в Telegram Mini App.</p>
              <p>Для тестирования перейдите на <a href="/test" className="text-blue-400 underline">тестовую страницу</a>.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-white/70 text-sm">
              Вход в систему…
            </div>
            <div className="text-white/50 text-xs">
              Ожидание данных от Telegram…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


