'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { useEffect, useRef, useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerBottomPanel } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import StudentForm from '@/components/student-form';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const { isStudentFormOpen, openStudentForm, closeStudentForm } = useUIStore();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [color, setColor] = useState<string>('#226095');
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [formState, setFormState] = useState<{ isPending: boolean; mode: 'create' | 'edit' }>({ isPending: false, mode: 'create' });
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHidingUI, setIsHidingUI] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

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

  const handleSubmit = () => {
    console.log('handleSubmit called, formRef.current:', formRef.current);
    if (formRef.current) {
      console.log('Calling requestSubmit on form');
      formRef.current.requestSubmit();
    } else {
      console.log('formRef.current is null');
    }
  };

  // Убираем внешний onSubmit, чтобы StudentForm использовал встроенную логику сохранения

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setIsColorPickerOpen(false);
    // Показываем UI обратно после завершения анимации закрытия color picker
    setTimeout(() => {
      setIsHidingUI(false);
    }, 350); // Ждем завершение анимации закрытия color picker (300ms) + небольшая задержка
  };

  const handleColorPickerOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Сначала скрываем UI с анимацией
      setIsHidingUI(true);
      // Затем открываем color picker после завершения анимации скрытия
      setTimeout(() => {
        setIsColorPickerOpen(true);
      }, 500); // Ждем полное завершение анимации скрытия (500ms)
    } else {
      setIsColorPickerOpen(false);
      // Показываем UI обратно после небольшой задержки
      setTimeout(() => {
        setIsHidingUI(false);
      }, 100);
    }
  };

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
                </div>
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
            </div>
            <DrawerClose asChild>
              <button className="text-sm opacity-70">Закрыть</button>
            </DrawerClose>
          </DrawerHeader>
          <ScrollArea className="h-[80vh]">
            <div className="p-2 pt-0 pb-20">
              <StudentForm 
                teacherId={teacherIdSafe} 
                color={color} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onStateChange={setFormState}
                ref={formRef}
              />
            </div>
          </ScrollArea>
          <DrawerBottomPanel>
            <div className="flex items-center gap-4">
              {/* Color picker */}
              <ColorPicker
                value={color}
                onChange={handleColorChange}
                onOpenChange={handleColorPickerOpenChange}
                className="flex-shrink-0 mt-1"
              />
              
              {/* Tabs - скрываются при открытии color picker */}
              <div 
                className={`flex-1 transition-all duration-500 ease-in-out transform ${
                  isHidingUI 
                    ? 'opacity-0 -translate-y-2 pointer-events-none scale-95' 
                    : 'opacity-100 translate-y-0 scale-100'
                }`}
                style={{ willChange: 'transform, opacity' }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Основные</TabsTrigger>
                    <TabsTrigger value="contacts">Контакты</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Submit button - скрывается при открытии color picker */}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={formState.isPending}
                className={`text-white px-6 rounded-full shadow-lg transition-all duration-500 ease-in-out transform ${
                  isHidingUI 
                    ? 'opacity-0 -translate-y-2 pointer-events-none scale-95' 
                    : 'opacity-100 translate-y-0 scale-100'
                }`}
                style={{ willChange: 'transform, opacity' }}
                aria-label={formState.mode === 'create' ? 'Создать' : 'Сохранить'}
              >
                {formState.isPending ? 'Сохраняем…' : formState.mode === 'create' ? 'Создать' : 'Сохранить'}
              </Button>
            </div>
          </DrawerBottomPanel>
        </DrawerContent>
      </Drawer>
    </div>
  );
}


