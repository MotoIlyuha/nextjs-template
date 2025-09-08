# Архитектура приложения "Репетитор-менеджер"

## Цель
Приложение для репетиторов: управление учениками, расписанием, заданиями, файлами и финансами. Интеграция с Telegram как Mini App.

## Стек
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (Auth, Database, Storage)
- Интеграция: Telegram WebApp SDK (`@tma.js/sdk`)
- Хостинг: Vercel
- Состояние: Zustand
- UI: shadcn/ui

## Модули
1. Авторизация (Telegram → Supabase)
2. Ученики (CRUD, контакты, цена за занятие)
3. Расписание (занятия, повторения, файлы)
4. Задания (вопросы, статусы)
5. Файлы (Supabase Storage)
6. Финансы (оплаты, автооплата)

## Принципы
- Все данные привязаны к `user_id` из Supabase Auth.
- RLS включен для всех таблиц.
- UI под Telegram: используем `themeParams`, кнопки в стиле TMA.
- Никакого SSR — только CSR (Mini App).