Ограничения и правила для AI

Что НЕ делать
- Не использовать SSR — все страницы клиентские (use client).
- Не использовать Next.js Route Handlers для авторизации — только Server Actions или Edge Functions.
- Не хранить пароли — только Telegram Auth через initData.
- Не использовать Material UI, Ant Design, Chakra UI — только shadcn/ui + Tailwind CSS.
- Не генерировать глобальные стили — только классы Tailwind в компонентах.
- Не использовать Zustand для хранения данных из Supabase — только для UI-состояния (формы, табы, модалки).
- Не использовать React Query для состояния формы — только для серверного состояния (данные из БД).
- Не передавать service_role ключ на клиент — только в Edge Function и API-роутах.
- Не использовать @telegram-apps/sdk-react — только @tma.js/sdk (useInitData, useThemeParams).
- Не создавать дублирующиеся компоненты — используйте шаблоны из shadcn/ui.
- Не генерировать код без unit-тестов для хуков и утилит.

Что ОБЯЗАТЕЛЬНО
- Все таблицы Supabase — с RLS, проверять каждый запрос на auth.uid().
- Все запросы к Supabase — строго типизированы через generated types из supabase gen types.
- Все компоненты — в папке app/, с директивой 'use client'.
- Все формы — с валидацией через Zod + react-hook-form.
- Все хуки работы с данными — через React Query (useQuery, useMutation).
- Все UI-компоненты — на основе shadcn/ui (Button, Input, Card, Form и т.д.).
- Все логические единицы (хуки, утилиты) — с unit-тестами (Vitest).
- Все изменения архитектуры — фиксировать в specs/history.md с привязкой к коммиту.
- Все миграции SQL — в папке supabase/migrations/ с нумерацией (001_, 002_...).
- Все API-роуты — в app/api/.../route.ts.
- Все типы интерфейсов — в types/supabase.ts (генерируются через npx supabase gen types).
- Все спецификации — в папке specs/ (architecture.md, history.md, database.md, students.md).
- Все стили — через Tailwind, CSS-переменные Telegram (--tg-theme-*).
- Все роуты — без SSR, без getServerSideProps, без getStaticProps.
- Все данные от Telegram — валидируются на сервере через validateInitData() из @tma.js/sdk.
- Все секреты (TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY) — только в окружении, не в коде.