# Архитектура приложения "Репетитор-менеджер"

## Цель
Приложение для репетиторов: управление учениками, расписанием, заданиями, файлами и финансами. Интеграция с Telegram как Mini App.

## Стек
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (Auth, Database, Storage, Edge Functions)
- Интеграция: Telegram WebApp SDK (`@tma.js/sdk`)
- Хостинг: Vercel
- State Management: Zustand (UI-состояние), React Query (серверное состояние)
- UI Library: shadcn/ui
- Валидация: Zod
- Тестирование: Vitest + @testing-library/react

## Модули

### 1. Авторизация (Telegram → Supabase)
- Используется `useInitData()` из `@tma.js/sdk` на клиенте.
- API-роут `/api/auth/telegram`:
  - Принимает `initDataRaw`
  - Валидирует подпись через `@tma.js/sdk` и `TELEGRAM_BOT_TOKEN`
  - Передаёт проверенные данные (`user_id`, `first_name`, `username`, `photo_url`) в Supabase Edge Function
- Edge Function `telegram-auth`:
  - Проверяет секрет `EDGE_AUTH_TELEGRAM_SECRET`
  - Создаёт/находит пользователя в `auth.users` через `admin.createUser()`
  - Создаёт запись в `teachers` (id → auth.users.id)
  - Генерирует и возвращает реальную JWT-сессию (`session`)
- Клиентская логика:
  - При первом запуске — показывается `/onboarding`
  - После нажатия “Начать” — вызывается `/api/auth/telegram`
  - После успешной авторизации — редирект на `/app`
  - Для существующих пользователей — прямой редирект на `/app`

### 2. Ученики (CRUD, контакты, базовые данные)
- Таблица `students`:
  - `id` (uuid, PK)
  - `teacher_id` (uuid, FK → teachers.id, not null)
  - `first_name` (text, not null)
  - `last_name` (text)
  - `phone` (text)
  - `email` (text)
  - `address` (text) — только если `is_online = false`
  - `is_online` (boolean, default false) — флаг "онлайн/очно"
  - `color` (text, default "#226095") — цвет для календаря
  - `note` (text) — заметка о ученике
  - `auto_pay` (boolean, default true) — автооплата по умолчанию
  - `created_at` (timestamp)
- RLS: `teacher_id = auth.uid()`
- Индекс: `idx_students_teacher_id`
- **Цена за занятие НЕ хранится здесь!**
- Дополнительно:
  - `student_contacts` — мессенджеры: `{ type: 'telegram', value: '@MotoIlyuha' }`
  - `student_relations` — родственники: `{ relation_name: 'Мама', contact_value: '+79123456789' }`
- UI:
  - Форма `StudentForm` с динамическими полями:
    - Переключатель “очно/онлайн” → показывает/скрывает поле адреса
    - Добавление/удаление контактов (мессенджеры)
    - Добавление/удаление родственников
    - Выбор цвета для календаря
    - Поле примечания
  - Валидация: Zod + React Hook Form
  - Загрузка данных: React Query (`useStudents`)

### 3. Расписание (шаблоны и реальные занятия)
- Таблица `lesson_templates` — шаблоны повторяющихся занятий:
  - `id` (uuid, PK)
  - `teacher_id` (uuid, FK → teachers.id, not null)
  - `student_id` (uuid, FK → students.id, not null)
  - `subject` (text, not null)
  - `duration_minutes` (integer, not null, > 0)
  - `day_of_week` (integer, not null, 0=воскресенье...6=суббота)
  - `start_time` (time, not null)
  - `price` (numeric, not null, > 0)
  - `note` (text)
  - `created_at` (timestamp)
  - `is_active` (boolean, default true)
- RLS: `teacher_id = auth.uid()`
- Индексы: `(teacher_id, student_id, day_of_week)`, `(start_time)`
- Таблица `lessons` — реальные события:
  - `id` (uuid, PK)
  - `teacher_id` (uuid, FK → teachers.id, not null)
  - `student_id` (uuid, FK → students.id, not null)
  - `template_id` (uuid, FK → lesson_templates.id, nullable)
  - `subject` (text, not null)
  - `start_time` (timestamp, not null)
  - `end_time` (timestamp, not null)
  - `price` (numeric, not null, > 0) — **фактическая цена на момент проведения**
  - `note` (text)
  - `status` (text, enum: 'scheduled', 'completed', 'cancelled', 'rescheduled', 'unpaid', 'paid')
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- RLS: `teacher_id = auth.uid()`
- Индексы: `(teacher_id, student_id, start_time)`, `(status)`

### 4. Контакты и родственники
- Таблица `student_contacts`:
  - `id` (uuid, PK)
  - `student_id` (uuid, FK → students.id, not null)
  - `type` (enum: 'phone', 'email', 'telegram', 'whatsapp', 'viber', 'other')
  - `value` (text, not null)
  - `created_at` (timestamp)
- Таблица `student_relations`:
  - `id` (uuid, PK)
  - `student_id` (uuid, FK → students.id, not null)
  - `relation_name` (text, not null)
  - `contact_value` (text, not null)
  - `created_at` (timestamp)
- RLS: `student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())`
- Индексы: `student_id`

### 5. Задания (вопросы, статусы)
- Таблицы:
  - `assignments`: `id`, `teacher_id`, `student_id`, `title`, `status`, `due_date`, `created_at`
  - `assignment_questions`: `id`, `assignment_id`, `question_text`, `order`
- RLS: `teacher_id = auth.uid()`
- Будет реализовано после модуля “Занятия”

### 6. Файлы (Supabase Storage)
- Таблица `files`:
  - `id`, `teacher_id`, `name`, `path`, `folder`, `mime_type`, `size`, `created_at`
- RLS: `teacher_id = auth.uid()`
- Хранение: Supabase Storage (папки: `/lessons/{lesson_id}`, `/assignments/{assignment_id}`)
- Будет реализовано после модуля “Занятия”

### 7. Финансы (оплаты, автооплата)
- Таблица `payments`:
  - `id`, `teacher_id`, `student_id`, `lesson_id`, `amount`, `is_paid`, `paid_at`, `created_at`
- RLS: `teacher_id = auth.uid()`
- Автооплата: если `students.auto_pay = true` — при статусе `completed` → создаётся запись `payments` с `is_paid = true`
- Отчёт: сумма по месяцам, по ученикам, по статусам

## Принципы

- ✅ Все данные привязаны к `auth.uid()` — через `teacher_id` в каждой таблице.
- ✅ RLS включен для всех таблиц — нет утечек данных между пользователями.
- ✅ Никакого SSR — только CSR (Mini App).
- ✅ Используется `@tma.js/sdk` — единственный SDK для работы с Telegram.
- ✅ Стиль UI — под Telegram — темы применяются через `themeParams` → CSS-переменные.
- ✅ Типизация строгая — все типы генерируются через `supabase gen types`.
- ✅ Валидация — на клиенте и сервере — Zod для форм, Supabase RLS и чеки для API.
- ✅ Клиентское состояние — Zustand (формы, табы, модалки).
- ✅ Серверное состояние — React Query (данные из Supabase).
- ✅ Цена за занятие — динамическая — хранится в `lessons.price`, а не в `students`.
- ✅ Все изменения фиксируются в `specs/history.md` — с привязкой к коммитам.
- ✅ Unit-тесты пишутся для каждого хука и утилиты — через Vitest.

## Безопасность

- 🔐 `TELEGRAM_BOT_TOKEN` — используется для валидации `initData` на сервере.
- 🔐 `SUPABASE_SERVICE_ROLE_KEY` — доступен ТОЛЬКО в Edge Function и API-роутах.
- 🔐 `SUPABASE_AUTH_TELEGRAM_SECRET` — используется для авторизации запросов к Edge Function.
- 🔐 Никакие ключи не передаются на клиент.
- 🔐 Все запросы к Supabase — через RLS, никогда без фильтрации по `auth.uid()`.

## Инструменты и процессы

- 🛠️ Разработка: Cursor AI + `.cursor/rules/` — для генерации кода
- 🧩 Архитектура: `specs/architecture.md`, `specs/history.md`, `specs/database.md`
- 📦 Версионирование: Git + семантические коммиты (`feat:`, `fix:`, `test:`, `chore:`)
- 🔄 CI/CD: планируется — тесты + деплой на Vercel при пуше в `main`
- 📊 Документация: `specs/` — основной источник правды