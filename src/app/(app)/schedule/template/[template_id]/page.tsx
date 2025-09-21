'use client';

import { useSignal, themeParams as _tp } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, Minus, Plus, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useStudents } from '@/hooks/useStudents';
import { useCreateLessonTemplate } from '@/hooks/useLessonTemplates';
import { LessonTemplateFormSchema, type LessonTemplateFormValues } from '@/schemas/lesson-template';

interface TemplatePageProps {
  params: Promise<{ template_id: string }>;
}

export default function TemplatePage({ params }: TemplatePageProps) {
  const tp = useSignal(_tp.state);
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [daySchedules, setDaySchedules] = useState<Record<number, Array<{
    id: string;
    startTime: string;
    endTime: string;
    price: string;
    duration: number;
  }>>>({});
  const [note, setNote] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState<boolean>(true);

  const predefinedSubjects = [
    'Математика',
    'Информатика', 
    'Физика',
    'Химия',
    'Русский язык',
    'Литература',
    'История',
    'Биология'
  ];

  const filteredSubjects = predefinedSubjects.filter(subjectName =>
    subjectName.toLowerCase().includes(subject.toLowerCase())
  );
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [savedRows, setSavedRows] = useState<Record<string, {
    startTime: string;
    endTime: string;
    price: string;
    duration: number;
  }>>({});

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

  const teacherIdSafe = teacherId ?? '';
  const { data: students, isLoading: studentsLoading } = useStudents(teacherIdSafe);
  const createTemplateMutation = useCreateLessonTemplate(teacherIdSafe);

  const handleBack = () => {
    router.back();
  };

  const toggleDay = (dayValue: number) => {
    setDaySchedules(prev => {
      const currentSchedules = prev[dayValue] || [];
      if (currentSchedules.length > 0) {
        // Если есть занятия, удаляем их
        const newSchedules = { ...prev };
        delete newSchedules[dayValue];
        // Если удаляемый день был активным, сбрасываем активный день
        if (activeDay === dayValue) {
          setActiveDay(null);
        }
        return newSchedules;
      } else {
        // Если нет занятий, добавляем пустое занятие и делаем день активным
        setActiveDay(dayValue);
        return {
          ...prev,
          [dayValue]: [{ 
            id: '1', 
            startTime: '', 
            endTime: '', 
            price: '', 
            duration: 45 
          }]
        };
      }
    });
  };

  const selectDay = (dayValue: number) => {
    // Просто переключаем активный день, не изменяя занятия
    if (daySchedules[dayValue] && daySchedules[dayValue].length > 0) {
      setActiveDay(dayValue);
    }
  };

  const addTimeRow = (dayValue: number) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const newId = (currentSchedules.length + 1).toString();
    setDaySchedules(prev => ({
      ...prev,
      [dayValue]: [...currentSchedules, { 
        id: newId, 
        startTime: '', 
        endTime: '', 
        price: '', 
        duration: 45 
      }]
    }));
  };

  const removeTimeRow = (dayValue: number, id: string) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const uniqueId = `${dayValue}-${id}`;
    
    if (currentSchedules.length > 1) {
      setDaySchedules(prev => ({
        ...prev,
        [dayValue]: currentSchedules.filter(row => row.id !== id)
      }));
      // Удаляем сохраненное состояние
      setSavedRows(prev => {
        const newSaved = { ...prev };
        delete newSaved[uniqueId];
        return newSaved;
      });
    } else {
      // Если строка одна, очищаем поля
      setDaySchedules(prev => ({
        ...prev,
        [dayValue]: currentSchedules.map(row => 
          row.id === id 
            ? { ...row, startTime: '', endTime: '', price: '' }
            : row
        )
      }));
      // Очищаем сохраненное состояние
      setSavedRows(prev => {
        const newSaved = { ...prev };
        delete newSaved[uniqueId];
        return newSaved;
      });
    }
  };

  const updateTimeRow = (dayValue: number, id: string, field: string, value: string | number) => {
    setDaySchedules(prev => ({
      ...prev,
      [dayValue]: (prev[dayValue] || []).map(row => 
        row.id === id 
          ? { ...row, [field]: value }
          : row
      )
    }));
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (dayValue: number, id: string, duration: number) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const row = currentSchedules.find(r => r.id === id);
    if (row && row.startTime) {
      const endTime = calculateEndTime(row.startTime, duration);
      updateTimeRow(dayValue, id, 'duration', duration);
      updateTimeRow(dayValue, id, 'endTime', endTime);
    } else {
      updateTimeRow(dayValue, id, 'duration', duration);
    }
  };

  const handleStartTimeChange = (dayValue: number, id: string, startTime: string) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const row = currentSchedules.find(r => r.id === id);
    if (row) {
      const endTime = calculateEndTime(startTime, row.duration);
      updateTimeRow(dayValue, id, 'startTime', startTime);
      updateTimeRow(dayValue, id, 'endTime', endTime);
    }
  };

  const handleEndTimeChange = (dayValue: number, id: string, endTime: string) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const row = currentSchedules.find(r => r.id === id);
    if (row && row.startTime) {
      const duration = calculateDuration(row.startTime, endTime);
      updateTimeRow(dayValue, id, 'endTime', endTime);
      updateTimeRow(dayValue, id, 'duration', duration);
    } else {
      updateTimeRow(dayValue, id, 'endTime', endTime);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 45;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} минут`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return hours === 1 ? '1 час' : `${hours} часа`;
      } else {
        return `${hours} час ${remainingMinutes} минут`;
      }
    }
  };

  const isPresetDuration = (minutes: number) => {
    return [45, 60, 90].includes(minutes);
  };

  const isRowValid = (dayValue: number, id: string) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const row = currentSchedules.find(r => r.id === id);
    
    if (!row) return false;
    
    // Проверяем, что время начала и окончания заполнены
    if (!row.startTime || !row.endTime) return false;
    
    // Проверяем, что время окончания больше времени начала
    const startMinutes = timeToMinutes(row.startTime);
    const endMinutes = timeToMinutes(row.endTime);
    
    if (endMinutes <= startMinutes) return false;
    
    // Проверяем, что продолжительность больше 0
    if (row.duration <= 0) return false;
    
    return true;
  };

  const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isRowChanged = (dayValue: number, id: string) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const row = currentSchedules.find(r => r.id === id);
    const uniqueId = `${dayValue}-${id}`;
    const savedRow = savedRows[uniqueId];
    
    if (!savedRow) return true; // Новая строка
    
    if (!row) return false;
    
    return (
      row.startTime !== savedRow.startTime ||
      row.endTime !== savedRow.endTime ||
      row.price !== savedRow.price ||
      row.duration !== savedRow.duration
    );
  };

  const saveRow = (dayValue: number, id: string) => {
    const currentSchedules = daySchedules[dayValue] || [];
    const row = currentSchedules.find(r => r.id === id);
    
    if (row) {
      const uniqueId = `${dayValue}-${id}`;
      // Сохраняем текущее состояние строки
      setSavedRows(prev => ({
        ...prev,
        [uniqueId]: {
          startTime: row.startTime,
          endTime: row.endTime,
          price: row.price,
          duration: row.duration
        }
      }));
      
      // Добавляем новую строку
    //   addTimeRow(dayValue);
    }
  };

  const handleSave = async () => {
    if (!teacherId) return;

    setIsSaving(true);
    setErrors({});

    try {
      // Собираем сохраненные строки по дням недели
      const savedRowsByDay = Object.entries(daySchedules).reduce((acc, [day, schedules]) => {
        const dayNumber = parseInt(day);
        const savedSchedules = schedules.filter(schedule => 
          !isRowChanged(dayNumber, schedule.id)
        );
        
        if (savedSchedules.length > 0) {
          acc[dayNumber] = savedSchedules;
        }
        
        return acc;
      }, {} as Record<number, Array<{
        id: string;
        startTime: string;
        endTime: string;
        price: string;
        duration: number;
      }>>);

      // Проверяем, что есть хотя бы один день с сохраненными занятиями
      const daysWithSavedRows = Object.keys(savedRowsByDay).map(Number);
      if (daysWithSavedRows.length === 0) {
        setErrors({ 
          general: 'Сохраните хотя бы одно занятие перед сохранением шаблона' 
        });
        return;
      }

      // Создаем шаблоны для каждого дня отдельно
      for (const [day, schedules] of Object.entries(savedRowsByDay)) {
        const dayNumber = parseInt(day);
        
        // Валидируем данные для дня
        const formData: LessonTemplateFormValues = {
          studentId: selectedStudentId,
          subject: subject.trim(),
          selectedDays: [dayNumber],
          timeRows: schedules.map(schedule => ({
            id: schedule.id,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            price: schedule.price,
            duration: schedule.duration,
          })),
          note: note.trim() || undefined,
        };

        // Валидация с помощью Zod
        const validationResult = LessonTemplateFormSchema.safeParse(formData);
        
        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.issues.forEach((issue) => {
            const field = issue.path.join('.');
            fieldErrors[field] = issue.message;
          });
          setErrors(fieldErrors);
          return;
        }

        // Создаем шаблоны для этого дня
        await createTemplateMutation.mutateAsync(validationResult.data);
      }
      
      // Успешное сохранение - возвращаемся назад
      router.back();
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Произошла ошибка при сохранении' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    // TODO: Implement delete logic
    console.log('Deleting template');
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setShowSubjectSuggestions(value.length === 0 || filteredSubjects.length > 0);
  };

  const handleSubjectSelect = (selectedSubject: string) => {
    setSubject(selectedSubject);
    setShowSubjectSuggestions(false);
  };

  return (
    <div className="min-w-[400px] overflow-auto p-4 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="w-10 h-10 border-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 
          className="text-xl font-semibold" 
          style={{ color: tp.text_color ?? '#fff' }}
        >
          Настроить шаблон занятий
        </h1>
      </div>

      {/* Student Selection */}
      <div className="space-y-2">
        <label 
          className="text-sm font-medium" 
          style={{ color: tp.text_color ?? '#fff' }}
        >
          Ученик
        </label>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите ученика" />
          </SelectTrigger>
          <SelectContent>
            {studentsLoading ? (
              <SelectItem value="loading" disabled>
                Загрузка...
              </SelectItem>
            ) : students && students.length > 0 ? (
              students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: student.color || '#226095' }}
                    />
                    <span>
                      {student.first_name} {student.last_name || ''}
                    </span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-students" disabled>
                Нет учеников
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Input */}
      <div className="space-y-2">
        <label 
          className="text-sm font-medium" 
          style={{ color: tp.text_color ?? '#fff' }}
        >
          Предмет
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          placeholder="Например: Математика, Физика, Английский"
          className="w-full px-4 py-3 rounded-xl tg-border border tg-surface bg-transparent text-sm"
          style={{ 
            color: tp.text_color ?? '#fff',
            borderColor: tp.hint_color ?? '#999'
          }}
        />
        
        {/* Subject Suggestions */}
        {showSubjectSuggestions && filteredSubjects.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filteredSubjects.map((subjectName) => (
              <Button
                key={subjectName}
                variant="outline"
                size="sm"
                onClick={() => handleSubjectSelect(subjectName)}
                className="flex-shrink-0 whitespace-nowrap"
                style={{ 
                  color: tp.text_color ?? '#fff',
                  borderColor: tp.hint_color ?? '#999'
                }}
              >
                {subjectName}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Days of Week */}
      <div className="space-y-2">
        <label 
          className="text-sm font-medium" 
          style={{ color: tp.text_color ?? '#fff' }}
        >
          Дни недели
        </label>
        <div className="flex justify-stretch gap-2 overflow-x-auto pb-2">
          {[
            { value: 0, label: 'Пн' },
            { value: 1, label: 'Вт' },
            { value: 2, label: 'Ср' },
            { value: 3, label: 'Чт' },
            { value: 4, label: 'Пт' },
            { value: 5, label: 'Сб' },
            { value: 6, label: 'Вс' },
          ].map((day) => {
            const hasSchedules = daySchedules[day.value] && daySchedules[day.value].length > 0;
            const isActive = activeDay === day.value;
            const hasSavedSchedules = daySchedules[day.value] && daySchedules[day.value].some(row => 
              !isRowChanged(day.value, row.id)
            );
            
            return (
              <Button
                key={day.value}
                variant={hasSavedSchedules ? "default" : "outline"}
                size="sm"
                className={`flex-shrink-0 min-w-[44px] h-10 transition-all duration-200 ${
                  isActive ? 'shadow-lg border-3' : ''
                }`}
                onClick={() => {
                  if (daySchedules[day.value] && daySchedules[day.value].length > 0) {
                    // Если у дня есть занятия, просто переключаем активный день
                    selectDay(day.value);
                  } else {
                    // Если у дня нет занятий, добавляем/удаляем занятия
                    toggleDay(day.value);
                  }
                }}
                style={{ 
                  color: hasSavedSchedules ? (tp.button_text_color ?? '#fff') : (tp.text_color ?? '#fff'),
                  backgroundColor: hasSavedSchedules ? (tp.button_color ?? '#007AFF') : 'transparent',
                  borderColor: tp.hint_color ?? '#999',
                  boxShadow: isActive ? `0 0 0 2px ${tp.button_color ?? '#007AFF'}40` : 'none',
                  borderWidth: isActive ? '3px' : '1px'
                }}
              >
                {day.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Time and Price Settings */}
      {activeDay !== null && daySchedules[activeDay] && (
        <div className="space-y-2 !mt-2">
          {/* <label 
            className="text-sm font-medium" 
            style={{ color: tp.text_color ?? '#fff' }}
          >
            Настройки времени и стоимости - {[
              'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'
            ][activeDay]}
          </label> */}
          
          {daySchedules[activeDay].map((row, index) => (
            <div key={row.id} className={`space-y-3 p-3 rounded-xl tg-border border tg-surface relative ${
              !isRowChanged(activeDay, row.id) ? 'opacity-90' : ''
            }`}>

              {/* Time and Price Inputs */}
              <div className="flex items-end gap-3">
                <div className="space-y-1">
                  <label className="text-xs opacity-70" style={{ color: tp.text_color ?? '#fff' }}>
                    Начало
                  </label>
                  <input
                    type="time"
                    value={row.startTime}
                    onChange={(e) => handleStartTimeChange(activeDay, row.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg tg-border border bg-transparent text-sm"
                    style={{ 
                      color: tp.text_color ?? '#fff',
                      borderColor: !row.startTime && isRowChanged(activeDay, row.id) 
                        ? '#ef4444' 
                        : (tp.hint_color ?? '#999')
                    }}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs opacity-70" style={{ color: tp.text_color ?? '#fff' }}>
                    Окончание
                  </label>
                  <input
                    type="time"
                    value={row.endTime}
                    onChange={(e) => handleEndTimeChange(activeDay, row.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg tg-border border bg-transparent text-sm"
                    style={{ 
                      color: tp.text_color ?? '#fff',
                      borderColor: (!row.endTime || (row.startTime && row.endTime && timeToMinutes(row.endTime) <= timeToMinutes(row.startTime))) && isRowChanged(activeDay, row.id)
                        ? '#ef4444' 
                        : (tp.hint_color ?? '#999')
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs opacity-70" style={{ color: tp.text_color ?? '#fff' }}>
                    Стоимость (₽)
                  </label>
                  <input
                    type="number"
                    value={row.price}
                    min={0}
                    max={10000}
                    step={50}
                    onChange={(e) => updateTimeRow(activeDay, row.id, 'price', e.target.value)}
                    placeholder="900"
                    className="w-full px-3 py-2 rounded-lg tg-border border bg-transparent text-sm"
                    style={{ 
                      color: tp.text_color ?? '#fff',
                      borderColor: tp.hint_color ?? '#999'
                    }}
                  />
                </div>


                <div className="flex items-end">
                  {isRowChanged(activeDay, row.id) ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => saveRow(activeDay, row.id)}
                      disabled={!isRowValid(activeDay, row.id)}
                      className="w-full"
                      style={{ 
                        backgroundColor: isRowValid(activeDay, row.id) 
                          ? (tp.button_color ?? '#007AFF') 
                          : (tp.hint_color ?? '#999'),
                        color: tp.button_text_color ?? '#fff',
                        opacity: isRowValid(activeDay, row.id) ? 1 : 0.5
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeRow(activeDay, row.id)}
                      className="w-full"
                      style={{ 
                        color: tp.text_color ?? '#fff',
                        borderColor: tp.hint_color ?? '#999'
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
               {/* Duration Badges */}
               <div className="space-y-2">
                 {!isPresetDuration(row.duration) && (
                   <div className="text-sm font-medium" style={{ color: tp.text_color ?? '#fff' }}>
                     Продолжительность: {formatDuration(row.duration)}
                   </div>
                 )}
                 <div className="flex gap-2">
                   {[
                     { value: 45, label: '45 минут' },
                     { value: 60, label: '1 час' },
                     { value: 90, label: '1.5 часа' },
                   ].map((duration) => (
                     <Button
                       key={duration.value}
                       variant={row.duration === duration.value ? "default" : "outline"}
                       size="sm"
                       onClick={() => handleDurationChange(activeDay, row.id, duration.value)}
                       style={{ 
                         color: row.duration === duration.value ? (tp.button_text_color ?? '#fff') : (tp.text_color ?? '#fff'),
                         backgroundColor: row.duration === duration.value ? (tp.button_color ?? '#007AFF') : 'transparent',
                         borderColor: tp.hint_color ?? '#999',
                         borderRadius: '100px'
                       }}
                     >
                       {duration.label}
                     </Button>
                   ))}
                 </div>
               </div>
              {/* Индикатор сохранения */}
              {!isRowChanged(activeDay, row.id) && (
                <div className="absolute top-2 right-2">
                  <Save className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
          ))}

          {/* Add Row Button */}
          <Button
            variant="outline"
            onClick={() => addTimeRow(activeDay)}
            className="w-full"
            style={{ 
              color: tp.text_color ?? '#fff',
              borderColor: tp.hint_color ?? '#999'
            }}
          >
            <Plus className="w-4 h-4" /> 
            <span className="ml-2">Добавить занятие</span>
          </Button>
        </div>
      )}

      {/* Note Field */}
      <div className="space-y-2">
        <label 
          className="text-sm font-medium" 
          style={{ color: tp.text_color ?? '#fff' }}
        >
          Заметка
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Дополнительная информация о занятиях..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl tg-border border tg-surface bg-transparent text-sm resize-none"
          style={{ 
            color: tp.text_color ?? '#fff',
            borderColor: tp.hint_color ?? '#999'
          }}
        />
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="text-sm text-red-500">
            {errors.general && <div className="mb-2">{errors.general}</div>}
            {Object.entries(errors)
              .filter(([key]) => key !== 'general')
              .map(([field, message]) => (
                <div key={field} className="text-xs opacity-80">
                  {field}: {message}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleDelete}
          variant="outline"
          className="flex-1"
          style={{ 
            color: tp.text_color ?? '#fff',
            borderColor: tp.hint_color ?? '#999'
          }}
        >
          Удалить
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
          style={{ 
            backgroundColor: tp.button_color ?? '#007AFF',
            color: tp.button_text_color ?? '#fff',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'Сохранение...' : (() => {
            const savedCount = Object.entries(daySchedules).reduce((total, [day, schedules]) => {
              return total + schedules.filter(schedule => !isRowChanged(parseInt(day), schedule.id)).length;
            }, 0);
            return savedCount > 0 ? `Сохранить (${savedCount})` : 'Сохранить';
          })()}
        </Button>
      </div>
    </div>
  );
}
