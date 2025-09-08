'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { useQuery } from '@tanstack/react-query';

export default function RootPage() {
  const router = useRouter();
  const initData = useSignal(_initDataState);

  const tgId = initData?.user?.id;

  const { data, isFetching } = useQuery({
    queryKey: ['check-teacher', tgId],
    queryFn: async () => {
      if (!tgId) return { exists: false };
      const res = await fetch(`/api/check-teacher?user_id=${tgId}`, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      return res.ok ? json : { exists: false };
    },
    enabled: Boolean(tgId),
    retry: 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    let aborted = false;
    const timeout = setTimeout(() => {
      if (!aborted && !isFetching && !data) router.replace('/onboarding');
    }, 800);

    if (tgId && !isFetching && data) {
      if (data.exists) router.replace('/app');
      else router.replace('/onboarding');
    }
    return () => {
      aborted = true;
      clearTimeout(timeout);
    };
  }, [tgId, isFetching, data, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 text-sm text-white/70">
      Загрузка…
    </div>
  );
}


