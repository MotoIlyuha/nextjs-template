## 🗃️ Таблицы

### `teachers`
- `id` (uuid, PK) → `auth.users.id`
- `first_name` (text, not null)
- `username` (text)
- `photo_url` (text)
- `created_at` (timestamp)

### `students`
- `id` (uuid, PK)
- `teacher_id` (uuid, FK → `teachers.id`, not null)
- `first_name` (text, not null)
- `last_name` (text)
- `phone` (text)
- `email` (text)
- `price_per_lesson` (numeric, not null, > 0)
- `auto_pay` (boolean, default true)
- `created_at` (timestamp)

## 🔗 Связи
- `students.teacher_id` → `teachers.id` (ON DELETE CASCADE)

## 📈 Индексы
- `teachers(id)`
- `students(teacher_id)`
- `students(created_at)`