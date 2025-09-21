'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { setSupabaseSession } from '@/core/auth';
import { Button } from '@/components/ui/button';
import { create } from 'zustand';

interface UIState {
  isRegistering: boolean;
  setRegistering: (v: boolean) => void;
}

const useUIStore = create<UIState>((set) => ({
  isRegistering: false,
  setRegistering: (v) => set({ isRegistering: v }),
}));

export default function OnboardingPage() {
  const router = useRouter();
  const initData = useSignal(_initDataState);
  const { isRegistering, setRegistering } = useUIStore();

  useEffect(() => {
    const run = async () => {
      if (!initData?.user?.id) return;
      console.info('[onboarding] checking user:', initData.user.id);
      const res = await fetch(`/api/check-teacher?user_id=${initData.user.id}`, { cache: 'no-store' });
      const data = await res.json();
      console.info('[onboarding] exists:', data?.exists);
      if (data?.exists) router.replace('/app');
    };
    run();
  }, [initData?.user?.id, router]);

  const onStart = async () => {
    if (!initData?.user?.id) return;
    try {
      setRegistering(true);
      console.info('[onboarding] registering user:', initData.user.id);
      const res = await fetch('/api/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: initData.user }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Register failed');
      if (data?.session) {
        console.info('[onboarding] got session, setting supabase session');
        await setSupabaseSession(data.session);
      }
      router.replace('/app');
    } catch (e) {
      console.error('[onboarding] register error:', e);
    } finally {
      setRegistering(false);
    }
  };

  const avatar = initData?.user?.photo_url;
  const firstName = initData?.user?.first_name;
  const lastName = initData?.user?.last_name;
  const username = initData?.user?.username;
  const tgId = initData?.user?.id;

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-black/20 p-6 text-center backdrop-blur">
        <div className="mb-4 flex items-center justify-center">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="avatar" className="h-16 w-16 rounded-full" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-white/10" />
          )}
        </div>
        <h1 className="mb-1 text-xl font-semibold">Добро пожаловать в Репетитор-менеджер!</h1>
        <p className="mb-4 text-sm text-white/70">
          {firstName} {lastName} {username ? `(@${username})` : ''} · id: {tgId}
        </p>
        <p className="mb-6 text-xs text-white/60">
          Нажимая «Начать», вы соглашаетесь с
          {' '}<a className="underline" href="/terms" target="_blank" rel="noreferrer">Условиями использования</a>
          {' '}и{' '}
          <a className="underline" href="/privacy" target="_blank" rel="noreferrer">Политикой конфиденциальности</a>.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => router.push('/tutorial')}>
            Посмотреть обучение
          </Button>
          <Button disabled={isRegistering} onClick={onStart}>
            {isRegistering ? 'Начинаем…' : 'Начать'}
          </Button>
        </div>
      </div>
    </div>
  );
}


