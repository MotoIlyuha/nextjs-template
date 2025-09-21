'use client';

import { useSignal, themeParams as _tp, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { localesMap } from '@/core/i18n/config';
import { setLocale } from '@/core/i18n/locale';
import { Locale } from '@/core/i18n/types';
import { useUIStore } from '@/stores/uiStore';
import { ArchiveDrawer } from '@/components/ArchiveDrawer';
import { Archive } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function SettingsPage() {
  const tp = useSignal(_tp.state);
  const initData = useSignal(_initDataState);
  const router = useRouter();
  const locale = useLocale();
  const { openArchiveDrawer } = useUIStore();
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const avatar = initData?.user?.photo_url;
  const firstName = initData?.user?.first_name;
  const lastName = initData?.user?.last_name;
  const tgId = initData?.user?.id;

  // Инициализация teacherId из сессии Supabase
  useEffect(() => {
    let aborted = false;
    const supabase = createClient();
    supabase.auth.getSession()
      .then(({ data }) => {
        if (aborted) return;
        const id = data.session?.user?.id || null;
        if (id) setTeacherId(id);
        else router.replace('/');
      })
      .catch(() => {
        if (!aborted) router.replace('/');
      });
    return () => { aborted = true; };
  }, [router]);

  const handleLogout = () => {
    // Очистка данных и перенаправление на страницу входа
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  const handleLocaleChange = (value: string) => {
    const newLocale = value as Locale;
    setLocale(newLocale);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-shrink-0">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="avatar" className="h-12 w-12 rounded-full" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-white/10" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate" style={{ color: tp.text_color ?? '#fff' }}>
            {firstName} {lastName}
          </h1>
          <p className="text-sm opacity-70 truncate" style={{ color: tp.text_color ?? '#fff' }}>
            Telegram ID: {tgId}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {localesMap.map((localeOption) => (
                <SelectItem key={localeOption.key} value={localeOption.key}>
                  {localeOption.key.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <h2 className="text-lg font-medium" style={{ color: tp.text_color ?? '#fff' }}>
        Настройки
      </h2>
      
      <div className="space-y-3">
        <Button 
          onClick={openArchiveDrawer}
          className="w-full"
          variant="outline"
          disabled={!teacherId}
        >
          <Archive className="h-4 w-4 mr-2" />
          Архив учеников
        </Button>
        
        <Button 
          onClick={() => router.push('/test')}
          className="w-full"
          variant="outline"
        >
          Перейти к тестам
        </Button>
        
        <Button 
          onClick={() => router.push('/launcher')}
          className="w-full"
          variant="outline"
        >
          Перейти к лаунчеру
        </Button>
        
        <Button 
          onClick={handleLogout}
          className="w-full"
          variant="destructive"
        >
          Выйти
        </Button>
      </div>
      
      {teacherId && <ArchiveDrawer teacherId={teacherId} />}
    </div>
  );
}
