Модуль "Ученики"
Поля таблицы `students`
id (uuid, PK)
teacher_id (uuid, ссылка на `auth.users.id`, not null)
first_name (text, not null)
last_name (text)
phone (text, опционально)
email (text, опционально)
address (text, опционально) — только если is_online = false
is_online (boolean, default false) — флаг "онлайн/очно"
color (text, default "#226095") — цвет для отображения в таблице
is_archived (boolean, default false) — пометка "в архиве"
class_or_course (integer, check 0-15) — 0-9: классы 1-10, 10-15: курсы 1-6
note (string) - Заметка об ученике
created_at (timestamp with time zone, default now())
RLS
SELECT/UPDATE/DELETE — только если `teacher_id = auth.uid()`
UI
Список учеников: имя, класс/курс (например, "5 класс"), цвет (цветной круг), статус (онлайн/очно), архив (флаг), заметка
Кнопка “+ Добавить ученика”
Форма добавления/редактирования:
Имя*, фамилия
Телефон, email
Переключатель “Очно / Онлайн” → при “Очно” — поле адреса
Цвет (выбор из палитры или HEX)
Выпадающий список “Класс/Курс” (0-15)
Раздел “Контакты”:
Тип: телефон, email, telegram, whatsapp, viber, другой
Значение
Кнопка “+ Добавить контакт”
Возможность удалить
Раздел “Родственники”:
Имя отношения (например, “Мама”, “Папа”)
Контакт (номер, мессенджер, email)
Кнопка “+ Добавить родственника”
Возможность удалить
Валидация: Zod + React Hook Form (на клиенте и сервере)
Типы TypeScript
export interface Student {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_online: boolean;
  color: string;
  is_archived: boolean;
  class_or_course: number;
  note: string;
  created_at: string;
}