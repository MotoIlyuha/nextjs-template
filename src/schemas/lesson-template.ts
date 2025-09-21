import { z } from 'zod';

// Схема для одной строки времени и стоимости
export const TimeRowSchema = z.object({
  id: z.string(),
  startTime: z.string().min(1, 'Время начала обязательно'),
  endTime: z.string().min(1, 'Время окончания обязательно'),
  price: z.string().min(1, 'Стоимость обязательна').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Стоимость должна быть положительным числом'
  ),
  duration: z.number().min(15, 'Минимальная длительность 15 минут').max(240, 'Максимальная длительность 4 часа'),
});

// Схема для формы шаблона занятий
export const LessonTemplateFormSchema = z.object({
  studentId: z.string().min(1, 'Выберите ученика'),
  subject: z.string().min(1, 'Название предмета обязательно').max(100, 'Название предмета слишком длинное'),
  selectedDays: z.array(z.number().min(0).max(6)).min(1, 'Выберите хотя бы один день недели'),
  timeRows: z.array(TimeRowSchema).min(1, 'Добавьте хотя бы одну строку времени'),
  note: z.string().optional(),
});

// Схема для создания шаблона в базе данных
export const CreateLessonTemplateSchema = z.object({
  teacher_id: z.string().uuid(),
  student_id: z.string().uuid(),
  subject: z.string().min(1).max(100),
  duration_minutes: z.number().min(15).max(240),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  price: z.number().positive(),
  note: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// Схема для обновления шаблона
export const UpdateLessonTemplateSchema = CreateLessonTemplateSchema.partial().omit({
  teacher_id: true,
  student_id: true,
});

// Типы TypeScript
export type TimeRow = z.infer<typeof TimeRowSchema>;
export type LessonTemplateFormValues = z.infer<typeof LessonTemplateFormSchema>;
export type CreateLessonTemplateValues = z.infer<typeof CreateLessonTemplateSchema>;
export type UpdateLessonTemplateValues = z.infer<typeof UpdateLessonTemplateSchema>;

// Вспомогательные функции валидации
export const validateTimeFormat = (time: string): boolean => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const validateDayOfWeek = (day: number): boolean => {
  return day >= 0 && day <= 6;
};

export const validateDuration = (duration: number): boolean => {
  return duration >= 15 && duration <= 240;
};

export const validatePrice = (price: string): boolean => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
};
