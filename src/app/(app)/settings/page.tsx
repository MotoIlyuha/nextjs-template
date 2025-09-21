'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';

export default function SettingsPage() {
  const tp = useSignal(_tp.state);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: tp.text_color ?? '#fff' }}>
        Настройки
      </h1>
      <div className="rounded-xl tg-border border tg-surface p-4">
        <p className="text-sm opacity-70" style={{ color: tp.text_color ?? '#fff' }}>
          Страница настроек в разработке
        </p>
      </div>
    </div>
  );
}
