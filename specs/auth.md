# Авторизация через Telegram Mini App

## Поток
1. Пользователь открывает Mini App в Telegram.
2. Приложение получает `initData` через `@tma.js/sdk`.
3. Отправляет `initData` на `/api/auth/telegram`.
4. Edge Function в Supabase проверяет подпись, извлекает `user_id`, `first_name`, `username`.
5. Создает или находит пользователя в `auth.users` и `teachers`.
6. Возвращает JWT-сессию.
7. Клиент сохраняет сессию и редиректит на `/dashboard`.

## Технические требования
- Использовать `@tma.js/sdk` для инициализации.
- API-роут: `app/api/auth/telegram/route.ts`
- Supabase Edge Function (или Server Action) для валидации initData.
- После авторизации — редирект на `/app` (основной интерфейс).