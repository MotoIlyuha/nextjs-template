Таблицы

teachers
- id (uuid, PK, ссылка на auth.users.id)
- first_name (text, not null)
- username (text)
- photo_url (text)
- created_at (timestamp with time zone, default now())

students
- id (uuid, PK)
- teacher_id (uuid, FK → teachers.id, not null, ON DELETE CASCADE)
- first_name (text, not null)
- last_name (text)
- phone (text)
- email (text)
- address (text, nullable) — только если is_online = false
- is_online (boolean, default false)
- color (text, default "#226095") — цвет для календаря
- note (text)
- auto_pay (boolean, default true)
- created_at (timestamp with time zone, default now())

lesson_templates
- id (uuid, PK)
- teacher_id (uuid, FK → teachers.id, not null, ON DELETE CASCADE)
- student_id (uuid, FK → students.id, not null, ON DELETE CASCADE)
- subject (text, not null)
- duration_minutes (integer, not null, check > 0)
- day_of_week (integer, not null, check between 0 and 6 — 0=воскресенье)
- start_time (time, not null)
- price (numeric, not null, check > 0)
- note (text)
- created_at (timestamp with time zone, default now())
- is_active (boolean, default true)

lessons
- id (uuid, PK)
- teacher_id (uuid, FK → teachers.id, not null, ON DELETE CASCADE)
- student_id (uuid, FK → students.id, not null, ON DELETE CASCADE)
- template_id (uuid, FK → lesson_templates.id, nullable)
- subject (text, not null)
- start_time (timestamp with time zone, not null)
- end_time (timestamp with time zone, not null)
- price (numeric, not null, check > 0)
- note (text)
- status (text, not null, default 'scheduled', check in ('scheduled', 'completed', 'cancelled', 'rescheduled', 'unpaid', 'paid'))
- created_at (timestamp with time zone, default now())
- updated_at (timestamp with time zone, default now())

student_contacts
- id (uuid, PK)
- student_id (uuid, FK → students.id, not null, ON DELETE CASCADE)
- type (text, not null, check in ('phone', 'email', 'telegram', 'whatsapp', 'viber', 'other'))
- value (text, not null)
- created_at (timestamp with time zone, default now())

student_relations
- id (uuid, PK)
- student_id (uuid, FK → students.id, not null, ON DELETE CASCADE)
- relation_name (text, not null)
- contact_value (text, not null)
- created_at (timestamp with time zone, default now())

Связи

- students.teacher_id → teachers.id
- lesson_templates.teacher_id → teachers.id
- lesson_templates.student_id → students.id
- lessons.teacher_id → teachers.id
- lessons.student_id → students.id
- lessons.template_id → lesson_templates.id
- student_contacts.student_id → students.id
- student_relations.student_id → students.id

Индексы

- teachers(id)
- students(teacher_id)
- students(created_at)
- lesson_templates(teacher_id, student_id, day_of_week)
- lesson_templates(start_time)
- lessons(teacher_id, student_id, start_time)
- lessons(status)
- student_contacts(student_id)
- student_relations(student_id)

RLS политики (Row Level Security)

- teachers: using (auth.uid() = id)
- students: using (teacher_id = auth.uid())
- lesson_templates: using (teacher_id = auth.uid())
- lessons: using (teacher_id = auth.uid())
- student_contacts: using (student_id in (select id from students where teacher_id = auth.uid()))
- student_relations: using (student_id in (select id from students where teacher_id = auth.uid()))

Примечания

- Цена за занятие хранится ТОЛЬКО в lesson_templates и lessons — НЕ в students.
- Все запросы к базе должны использовать RLS.
- Все внешние ключи имеют ON DELETE CASCADE.
- Используйте типизированные запросы через `supabase gen types`.
- Все поля типа text могут быть пустыми, но не NULL при NOT NULL.
- Все ENUM-значения (`type` в student_contacts) берутся из `ContactType` в types/supabase.ts.