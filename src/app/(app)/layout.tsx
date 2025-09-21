'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { usePathname, useRouter } from 'next/navigation';
import { MenuDock } from '@/components/ui/shadcn-io/menu-dock';
import { Users, Calendar, DollarSign, Settings } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tp = useSignal(_tp.state);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      label: 'Ученики',
      icon: Users,
      onClick: () => router.push('/students'),
    },
    {
      label: 'Расписание',
      icon: Calendar,
      onClick: () => router.push('/schedule'),
    },
    {
      label: 'Финансы',
      icon: DollarSign,
      onClick: () => router.push('/finance'),
    },
    {
      label: 'Настройки',
      icon: Settings,
      onClick: () => router.push('/settings'),
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: tp.bg_color ?? '#000',
        color: tp.text_color ?? '#fff'
      }}
    >
      {/* Основной контент */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Навигационный dock в нижней части */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="flex justify-center">
          <MenuDock
            items={menuItems}
            variant="compact"
            orientation="horizontal"
            showLabels={true}
            animated={true}
            className="shadow-lg bg-tg-surface/95 backdrop-blur-sm border-white/10"
          />
        </div>
      </div>
    </div>
  );
}
