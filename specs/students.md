# Модуль "Ученики"

## Поля таблицы `students`
- `id` (uuid, PK)
- `teacher_id` (uuid, ссылка на `auth.users.id`, not null)
- `first_name` (text, not null)
- `last_name` (text)
- `phone` (text)
- `email` (text)
- `address` (text, optional) — только если `is_online = false`
- `is_online` (boolean, default false) — флаг "онлайн/очно"
- `color` (text, default "#226095") — цвет для отображения в календаре
- `note` (text) — заметка преподавателя
- `created_at` (timestamp with time zone, default now())

## RLS
- SELECT/UPDATE/DELETE — только если `teacher_id = auth.uid()`

## Дополнительные таблицы (связанные)
- `student_contacts` — мессенджеры: `{ type: 'telegram', value: '@MotoIlyuha' }`
- `student_relations` — родственники: `{ relation_name: 'Мама', contact_value: '+79123456789' }`

## UI
- Список учеников: имя, фамилия, контакт, статус (онлайн/очно), цвет, заметка
- Кнопка “+ Добавить ученика”
- Форма добавления/редактирования:
  - Имя*, фамилия
  - Телефон, email
  - Переключатель “Очно / Онлайн” → при “Очно” — поле адреса
  - Поле “Цвет для календаря” (выбор HEX или палитра)
  - Поле “Примечание”
  - Раздел “Контакты”:
    - Тип: телефон, email, telegram, whatsapp, viber, другой
    - Значение
    - Кнопка “+ Добавить контакт”
    - Возможность удалить
  - Раздел “Родственники”:
    - Имя отношения (например, “Мама”, “Папа”)
    - Контакт (номер, мессенджер, email)
    - Кнопка “+ Добавить родственника”
    - Возможность удалить
- Валидация: Zod + React Hook Form (на клиенте и сервере)

## Типы TypeScript
```ts
export interface Student {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_online: boolean;
  created_at: string;
}