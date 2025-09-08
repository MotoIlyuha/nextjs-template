# Модуль "Ученики"

## Поля таблицы `students`
- id (uuid, PK)
- teacher_id (uuid, ссылка на `auth.users.id`)
- first_name (text)
- last_name (text)
- phone (text, опционально)
- email (text, опционально)
- price_per_lesson (numeric, обязательно)
- auto_pay (boolean, по умолчанию true)
- created_at (timestamp)

## RLS
- SELECT/UPDATE/DELETE — только если `teacher_id = auth.uid()`

## UI
- Список учеников (имя, цена, контакты)
- Кнопка “+ Добавить ученика”
- Форма: имя*, фамилия, телефон, email, цена*, чекбокс “Автооплата”
- Валидация на клиенте и сервере

## Типы TypeScript
```ts
interface Student {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  price_per_lesson: number;
  auto_pay: boolean;
  created_at: string;
}