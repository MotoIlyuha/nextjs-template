## 🆔 20250907-01

**Дата:** 2025-09-07  
**Статус:** ✅ Реализовано  
**Модуль:** infra  
**Заголовок:** Инициализация проекта на основе TMA Next.js шаблона  
**Ссылка:** [initial-commit-hash](https://github.com/username/tutor-manager/commit/initial)

### 📖 Контекст
Необходимо начать с готовой, совместимой с Telegram Mini App основы, чтобы не тратить время на настройку SDK, тем, роутинга.

### ✅ Решение
Использован шаблон https://github.com/Telegram-Mini-Apps/nextjs-template.git — он предоставляет:
- Готовую интеграцию с `@tma.js/sdk`
- Поддержку `initData`, `themeParams`
- Примеры компонентов под Telegram UI
- Настроенный Next.js App Router

### ↔️ Альтернативы
- Создать проект с нуля → отклонено, слишком много рутины.
- Использовать другой шаблон → отклонено, этот официально поддерживается сообществом TMA.

### ⚠️ Последствия
- Все последующие компоненты должны использовать `useInitData`, `useThemeParams` из `@tma.js/sdk`.
- Стили должны соответствовать `tailwind.config.js` шаблона.
- Нельзя использовать SSR — только CSR.

## 🆔 20250908-01

**Дата:** 2025-09-08  
**Статус:** ✅ Реализовано  
**Модуль:** auth, onboarding, infra  
**Заголовок:** Интеграция Supabase, онбординг и проверка пользователя при входе  
**Ссылка:** [commit:20250908-01](https://github.com/username/tutor-manager/commit/20250908-01)

### 📖 Контекст
Нужно обеспечить авторизацию через Telegram, регистрацию пользователя в Supabase, хранение профиля в таблице `public.users` с RLS, а также показывать онбординг только новым пользователям. Оптимизировать проверку существования и улучшить UX запуска приложения.

### ✅ Решение
- Добавлены API-роуты:
  - `app/api/auth/telegram/route.ts` — прокси к Edge Function для валидации initData и выдачи сессии.
  - `app/api/check-teacher/route.ts` — проверка наличия пользователя по `telegram_id` (service_role, HEAD+count).
  - `app/api/register-teacher/route.ts` — создание `auth.users` (admin), upsert профиля в `public.users`, откат при ошибке, возврат реальной сессии через `signInWithPassword`.
- Страницы:
  - `app/onboarding/page.tsx` — онбординг с TMA initData, кнопками (shadcn/ui), Zustand для загрузки.
  - `app/login/page.tsx` — отправка initData и установка сессии Supabase.
  - `app/page.tsx` — проверка пользователя при входе и редирект (React Query).
  - `app/terms/page.tsx`, `app/privacy/page.tsx` — заглушки для документов.
- Инфраструктура:
  - Клиенты Supabase: браузерный (`getSupabase`) и серверный (`getSupabaseAdmin/getSupabaseAnon`).
  - Включён React Query провайдер (`QueryProvider`).
  - Кастомная кнопка на базе shadcn/ui (`components/ui/button.tsx`).
- База данных (подготовлено к применению):
  - Таблица `public.users (id uuid PK → auth.users, telegram_id text, first_name, last_name, username, photo_url, created_at)`.
  - Индекс по `telegram_id`.
  - RLS политики: select/update/insert только для `id = auth.uid()`.

### ↔️ Альтернативы
- Проверять существование через клиентский anon-клиент и RLS → может давать ложные отрицания и сложнее в отладке. Выбрали service_role на сервере.
- Хранить `telegram_id` как bigint → риск потери точности в JS. Выбрали текст.

### ⚠️ Последствия
- В окружении должны быть заданы: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (только на сервере), `SUPABASE_AUTH_TELEGRAM_URL` (+ опционально `SUPABASE_AUTH_TELEGRAM_SECRET`).
- Email/Password провайдер в Supabase должен быть включён.
- Онбординг показывается только новым пользователям; существующие попадают сразу в `/app`.

## 🆔 20250908-02

**Дата:** 2025-09-08  
**Статус:** ✅ Реализовано  
**Модуль:** ui, theme  
**Заголовок:** shadcn/ui компоненты, страница `/test`, Tailwind и TMA-палитра  
**Ссылка:** [commit:20250908-02](https://github.com/username/tutor-manager/commit/20250908-02)

### 📖 Контекст
Нужно унифицировать UI на shadcn/ui и проверить реакцию интерфейса на смену темы Telegram.

### ✅ Решение
- Подключены Tailwind директивы в `app/_assets/globals.css` и связаны цвета с Telegram `themeParams` (`--tg-theme-*-color`).
- Добавлены компоненты shadcn/ui-подобные: `Button`, `Input`, `Select`, `Card*`, `Calendar` (на `react-day-picker`).
- Создана страница `app/test/page.tsx` с примерами кнопок, полей, списков и календаря и блоком вывода `themeParams`.
- Временный редирект с корня (`/`) на `/test` для быстрого тестирования палитры.

### ↔️ Альтернативы
- Использовать только `@telegram-apps/telegram-ui` — меньше контроля над Tailwind-классами и шадкн-экосистемой.

### ⚠️ Последствия
- Tailwind требуется в глобальных стилях; компоненты используют CSS-переменные Telegram, поэтому внешний вид соответствует текущей теме Telegram.

## 🆔 20250915-01

**Дата:** 2025-09-15  
**Статус:** ✅ Реализовано  
**Модуль:** auth, onboarding, infra  
**Заголовок:** Edge Function `telegram-auth`, авто-маршрутизация и правки онбординга  
**Ссылка:** [commit:20250915-01](https://github.com/username/tutor-manager/commit/20250915-01)

### 📖 Контекст
Нужно завершить серверную часть авторизации через Telegram Mini App на Supabase Edge, а также улучшить UX старта: не создавать сессию для новых пользователей до подтверждения (кнопка «Начать»), и корректно маршрутизировать существующих пользователей сразу в приложение.

### ✅ Решение
- Edge Function `supabase/functions/telegram-auth/index.ts`:
  - Валидация секрета (переменные без префикса `SUPABASE_`: `SB_URL`, `SB_ANON_KEY`, `SB_SERVICE_ROLE_KEY`, `EDGE_AUTH_TELEGRAM_SECRET`).
  - Создание/поиск пользователя в `auth.users` через Admin API (c fallback на `listUsers`).
  - Upsert в `public.teachers` с обязательным `telegram_id`.
  - Возврат реальной сессии (access/refresh tokens). Логи об успешном входе.
- Авто-маршрутизация на старте (`app/page.tsx`):
  - Сначала проверка наличия учителя по `telegram_id` → новый пользователь попадает на `/onboarding` без создания сессии.
  - Существующий — авторизуется через `/api/auth/telegram` и попадает на `/app`.
- Онбординг (`app/onboarding/page.tsx`):
  - Кнопка «Начать» регистрирует в Supabase и устанавливает сессию.

### ↔️ Альтернативы
- Создавать сессию сразу для всех пользователей → отклонено, нужен явный opt-in перед созданием учётки.

### ⚠️ Последствия
- Требуются корректно заданные секреты в функции и `.env.local`.
- Поведение старта отличается для новых и существующих пользователей (ожидаемо).

## 🆔 20250915-02

**Дата:** 2025-09-15  
**Статус:** ✅ Реализовано  
**Модуль:** security, api, students, ui  
**Заголовок:** Журналы входа, rate limit API, рефактор Students и именование компонентов  
**Ссылка:** [commit:20250915-02](https://github.com/username/tutor-manager/commit/20250915-02)

### 📖 Контекст
Снизить риски злоупотребления API, улучшить наблюдаемость, убрать серверное состояние из Zustand и привести имена к правилам воркспейса.

### ✅ Решение
- API:
  - `/api/auth/telegram` и `/api/check-teacher` — простой in-memory rate limit и логи успешного входа.
- Students:
  - `app/students/page.tsx` — `teacherId` берётся из `supabase.auth.getSession()` локально (без Zustand), передаётся в `useStudents` (RLS-friendly).  
- Именование:
  - Компонент формы: `components/student-form.tsx` (переименовано с `StudentForm.tsx`).
- Повторное использование логики:
  - Создан `core/telegramAuth.ts` с `loginWithInitData(...)` и подключен в `/page.tsx` и `/login`.

### ↔️ Альтернативы
- Держать `teacherId` в Zustand → отклонено (серверное состояние должно оставаться в React Query/клиенте Supabase).

### ⚠️ Последствия
- Rate limit — на процесс, не кластероустойчив, для продакшена потребуется внешний стор (Redis/Upstash).