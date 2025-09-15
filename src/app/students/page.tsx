'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { useEffect, useMemo, useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import StudentForm from '@/components/student-form';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const { isStudentFormOpen, openStudentForm, closeStudentForm } = useUIStore();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);

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

      {isStudentFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl tg-border border tg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Добавить ученика</h2>
              <button onClick={closeStudentForm} className="text-sm opacity-70">Закрыть</button>
            </div>
            <StudentForm teacherId={teacherIdSafe} />
          </div>
        </div>
      )}
    </div>
  );
}


