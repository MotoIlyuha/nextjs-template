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