'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { useEffect, useRef, useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { MoreVertical, Pencil, Trash2, Archive } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerBottomPanel } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import StudentForm from '@/components/student-form';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useArchiveStudent, useDeleteStudent } from '@students/hooks';
import StudentDrawer from '@/components/StudentDrawer';

export default function StudentsPage() {
  const { isStudentFormOpen, openStudentForm, closeStudentForm } = useUIStore();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [color, setColor] = useState<string>('#226095');
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [formState, setFormState] = useState<{ isPending: boolean; mode: 'create' | 'edit' }>({ isPending: false, mode: 'create' });
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHidingUI, setIsHidingUI] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [archiveDialogOpenFor, setArchiveDialogOpenFor] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [deleteDialogOpenFor, setDeleteDialogOpenFor] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isStudentDrawerOpen, setIsStudentDrawerOpen] = useState(false);

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
  const queryClient = useQueryClient();
  const { data: students, isLoading, isError } = useStudents(teacherIdSafe);
  const tp = useSignal(_tp.state);
  const archiveMutation = useArchiveStudent(teacherIdSafe);
  const deleteMutation = useDeleteStudent(teacherIdSafe);

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

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsStudentDrawerOpen(true);
  };

  const handleStudentDrawerClose = () => {
    setIsStudentDrawerOpen(false);
    setSelectedStudent(null);
  };

  const handleStudentEdit = (student: any) => {
    setActiveTab('basic');
    setFormState((prev) => ({ ...prev, mode: 'edit' }));
    setEditingStudent({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name ?? '',
      is_online: student.is_online ?? true,
      address: student.address ?? '',
      color: student.color ?? '#226095',
      note: student.note ?? '',
      contacts: student.student_contacts ?? [],
      relations: student.student_relations ?? [],
    });
    setColor((student.color as string) || '#226095');
    setIsStudentDrawerOpen(false);
    setSelectedStudent(null);
    openStudentForm();
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
              <div key={s.id} className="p-3 flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => handleStudentClick(s)}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="h-7 w-7 rounded-lg flex-shrink-0 border border-white/20"
                    style={{ backgroundColor: (s as any).color || '#226095' }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      <span className="truncate">{s.first_name} {s.last_name}</span>
                      <Badge
                        variant={null as any}
                        className={(s as any).is_online
                          ? 'border-transparent bg-green-600 text-white text-xs'
                          : 'border-transparent bg-blue-500 text-white text-xs'}
                      >
                        {(s as any).is_online ? 'Онлайн' : 'Очно'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className='border-none hover:bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)]' variant="ghost" size="icon" aria-label="Действия">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveTab('basic');
                          setFormState((prev) => ({ ...prev, mode: 'edit' }));
                          setEditingStudent({
                            id: s.id,
                            first_name: s.first_name,
                            last_name: s.last_name ?? '',
                            is_online: (s as any).is_online ?? true,
                            address: (s as any).address ?? '',
                            color: (s as any).color ?? '#226095',
                            note: (s as any).note ?? '',
                            contacts: (s as any).student_contacts ?? [],
                            relations: (s as any).student_relations ?? [],
                          });
                          setColor(((s as any).color as string) || '#226095');
                          openStudentForm();
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setArchiveDialogOpenFor(s.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        В архив
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => setDeleteDialogOpenFor(s.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                student={formState.mode === 'edit' ? editingStudent ?? undefined : undefined}
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

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteDialogOpenFor)} onOpenChange={(open: boolean) => {
        if (!open && !isDeleting) setDeleteDialogOpenFor(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить ученика</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить ученика? Это действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting} className='m-2'>Отмена</Button>
            </DialogClose>
            <Button
              className='m-2'
              variant="destructive"
              disabled={isDeleting || deleteMutation.isPending}
              onClick={async () => {
                if (!deleteDialogOpenFor) return;
                try {
                  setIsDeleting(true);
                  await deleteMutation.mutateAsync(deleteDialogOpenFor);
                  setDeleteDialogOpenFor(null);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting || deleteMutation.isPending ? 'Удаляем…' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive confirmation dialog */}
      <Dialog open={Boolean(archiveDialogOpenFor)} onOpenChange={(open: boolean) => {
        if (!open && !isArchiving) setArchiveDialogOpenFor(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Перенести в архив</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите перенести ученика в архив? Он пропадет из общего списка
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isArchiving} className='m-2'>Отмена</Button>
            </DialogClose>
            <Button
              className='m-2'
              disabled={isArchiving || archiveMutation.isPending}
              onClick={async () => {
                if (!archiveDialogOpenFor) return;
                try {
                  setIsArchiving(true);
                  await archiveMutation.mutateAsync(archiveDialogOpenFor);
                  setArchiveDialogOpenFor(null);
                } finally {
                  setIsArchiving(false);
                }
              }}
            >
              {isArchiving || archiveMutation.isPending ? 'Переносим…' : 'Перенести в архив'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Drawer */}
      <StudentDrawer
        student={selectedStudent}
        isOpen={isStudentDrawerOpen}
        onClose={handleStudentDrawerClose}
        onEdit={handleStudentEdit}
        onArchive={(studentId: string) => setArchiveDialogOpenFor(studentId)}
        onDelete={(studentId: string) => setDeleteDialogOpenFor(studentId)}
      />
    </div>
  );
}


