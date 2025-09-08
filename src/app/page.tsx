'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { useQuery } from '@tanstack/react-query';

export default function RootPage() {
  const router = useRouter();
  const initData = useSignal(_initDataState);

  // Временный редирект на страницу тестов палитры

  useEffect(() => {
    let aborted = false;
    const timeout = setTimeout(() => {
      if (!aborted) router.replace('/test');
    }, 0);
    return () => {
      aborted = true;
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 text-sm text-white/70">
      Загрузка…
    </div>
  );
}


