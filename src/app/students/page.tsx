'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import StudentForm from '@/components/student-form';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const { isStudentFormOpen, openStudentForm, closeStudentForm } = useUIStore();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [color, setColor] = useState<string>('#226095');
  const hiddenColorInputRef = useRef<HTMLInputElement | null>(null);

  // Инициализация teacherId из сессии Supabase (локально, без Zustand)
  useEffect(() => {
    let aborted = false;
    const supabase = createClient();
    supabase.auth.getSession()
      .then(({ data }) => {
        if (aborted) return;
        const id = data.session?.user?.id || null;
        if (id) setTeacherId(id);
        else router.replace('/login');
      })
      .catch(() => {
        if (!aborted) router.replace('/login');
      });
    return () => { aborted = true; };
  }, [router]);

  const teacherIdSafe = teacherId ?? '';
  const { data: students, isLoading, isError } = useStudents(teacherIdSafe);
  const tp = useSignal(_tp.state);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ученики</h1>
        <Button onClick={openStudentForm}>Добавить</Button>
      </div>

      {isLoading && <p style={{ color: tp.text_color ?? '#fff' }}>Загрузка…</p>}
      {isError && <p className="text-red-400">Ошибка загрузки</p>}

      {!isLoading && students && (
        <div className="rounded-xl tg-border border tg-surface divide-y divide-white/10">
          {students.length === 0 ? (
            <div className="p-4 text-sm opacity-70">Пока нет учеников</div>
          ) : (
            students.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.first_name} {s.last_name}</div>
                  <div className="text-sm opacity-70">{s.email || s.phone || '—'}</div>
                </div>
                <div className="text-sm">{s.price_per_lesson} ₽</div>
              </div>
            ))
          )}
        </div>
      )}

      <Drawer open={isStudentFormOpen} onOpenChange={(o) => (o ? openStudentForm() : closeStudentForm())}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center gap-3">
              <DrawerTitle>Добавить ученика</DrawerTitle>
              <button
                type="button"
                aria-label="Выбрать цвет"
                className="h-6 w-6 rounded-md border tg-border"
                style={{ backgroundColor: color }}
                onClick={() => hiddenColorInputRef.current?.click()}
              />
              <input
                ref={hiddenColorInputRef}
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="hidden"
                aria-hidden
                tabIndex={-1}
              />
            </div>
            <DrawerClose asChild>
              <button className="text-sm opacity-70">Закрыть</button>
            </DrawerClose>
          </DrawerHeader>
          <ScrollArea className="h-[80vh]">
            <div className="p-4 pt-0 pb-20">
              <StudentForm teacherId={teacherIdSafe} color={color} />
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}


