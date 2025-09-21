'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SchedulePage() {
  const tp = useSignal(_tp.state);
  const router = useRouter();

  const handleCreateTemplate = () => {
    const templateId = uuidv4();
    router.push(`/schedule/template/${templateId}`);
  };

  return (
    <div className="p-4 space-y-4 relative">
      <h1 className="text-xl font-semibold" style={{ color: tp.text_color ?? '#fff' }}>
        Расписание
      </h1>
      <div className="rounded-xl tg-border border tg-surface p-4">
        <p className="text-sm opacity-70" style={{ color: tp.text_color ?? '#fff' }}>
          Страница расписания в разработке
        </p>
      </div>
      
      {/* Floating Action Button */}
      <Button
        onClick={handleCreateTemplate}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
        style={{ 
          backgroundColor: tp.button_color ?? '#007AFF',
          color: tp.button_text_color ?? '#fff'
        }}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
