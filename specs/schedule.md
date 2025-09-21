# Модуль "Расписание"

## Поля таблицы `lesson_templates` (шаблоны)

- `id` (uuid, PK)
- `teacher_id` (uuid, FK → teachers.id, not null)
- `student_id` (uuid, FK → students.id, not null)
- `subject` (text, not null) — например, "Математика"
- `duration_minutes` (integer, not null, > 0) — продолжительность в минутах (60, 90, 120)
- `day_of_week` (integer, not null, 0-6) — 0=воскресенье, 1=понедельник... 6=суббота
- `start_time` (time, not null) — время начала, например `"16:00:00"`
- `price` (numeric, not null, > 0) — **цена за одно занятие по этому шаблону**
- `note` (text) — заметка (например, "Подготовка к ЕГЭ")
- `created_at` (timestamp with time zone, default now())
- `is_active` (boolean, default true) — если false — занятие не генерируется

## Поля таблицы `lessons` (реальные занятия)

- `id` (uuid, PK)
- `teacher_id` (uuid, FK → teachers.id, not null)
- `student_id` (uuid, FK → students.id, not null)
- `template_id` (uuid, FK → lesson_templates.id, nullable) — если создано из шаблона
- `subject` (text, not null) — копируется из шаблона или вручную
- `start_time` (timestamp with time zone, not null) — точное время проведения
- `end_time` (timestamp with time zone, not null) — рассчитывается как `start_time + duration_minutes`
- `price` (numeric, not null, > 0) — **фактическая цена на момент проведения** (может отличаться от шаблона!)
- `note` (text) — заметка преподавателя (например, "Ученик опоздал")
- `status` (text, not null, enum) — `scheduled`, `completed`, `cancelled`, `rescheduled`, `unpaid`, `paid`
- `created_at` (timestamp with time zone, default now())
- `updated_at` (timestamp with time zone, default now())

## Связи между таблицами

- `lesson_templates.teacher_id` → `teachers.id`
- `lesson_templates.student_id` → `students.id`
- `lessons.teacher_id` → `teachers.id`
- `lessons.student_id` → `students.id`
- `lessons.template_id` → `lesson_templates.id`

## RLS (Row Level Security)

- `lesson_templates`: `teacher_id = auth.uid()`
- `lessons`: `teacher_id = auth.uid()`

## Индексы для производительности

- `lesson_templates(teacher_id, student_id, day_of_week)`
- `lesson_templates(start_time)`
- `lessons(teacher_id, student_id, start_time)`
- `lessons(status)`

## UI — Функционал

### 1. Список занятий (`/app/schedule`)
- Отображение **по дням недели** (календарь или список)
- Каждое занятие:
  - Цветной круг (цвет ученика из `students.color`)
  - Имя ученика
  - Предмет
  - Время и продолжительность
  - Статус (цветом: синий — запланировано, зелёный — завершено, красный — отменено)
  - Кнопка "Редактировать" → открывает Drawer с формой
  - Кнопка "Удалить" → с подтверждением

### 2. Форма создания занятия (`LessonForm`)
- Открывается через кнопку "+" или из профиля ученика
- Поля:
  - Выбор ученика (из `useStudents()`)
  - Выбор предмета (автозаполнение или ввод)
  - Выбор дня недели (если создание шаблона)
  - Время начала (time picker)
  - Длительность (выпадающий список: 30, 45, 60, 90, 120 минут)
  - Цена (число, с автозаполнением из шаблона, если есть)
  - Чекбокс "Создать шаблон" — если включён, то создаётся `lesson_template` и `lesson`
  - Чекбокс "Повторять каждую неделю" — если включён, создаётся `lesson_template`
  - Поле "Заметка"
  - Статус (по умолчанию "scheduled")
- После сохранения:
  - Если "шаблон" — создаётся `lesson_template`
  - Если "одноразовое" — создаётся `lesson`
  - Если "повторять" — создаётся `lesson_template` и `lesson`

### 3. Редактирование занятия
- Можно менять:
  - Время, предмет, заметку, статус
  - **Цену** — если меняется, то **не меняется** шаблон!
- Нельзя менять:
  - Ученика (для сохранения истории)
  - Шаблон (если занятие создано из него)
- При изменении статуса:
  - "completed" → автоматически создается запись в `payments` (если `auto_pay = true`)
  - "cancelled" → можно отменить, но история сохраняется

## Типы TypeScript

```ts
export interface LessonTemplate {
  id: string;
  teacher_id: string;
  student_id: string;
  subject: string;
  duration_minutes: number;
  day_of_week: number;
  start_time: string;
  price: number;
  note?: string | null;
  created_at: string;
  is_active: boolean;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  student_id: string;
  template_id?: string | null;
  subject: string;
  start_time: string;
  end_time: string;
  price: number;
  note?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'unpaid' | 'paid';
  created_at: string;
  updated_at: string;
}