# Тесты для страницы шаблона занятий

Этот каталог содержит тесты для страницы настройки шаблона занятий (`/schedule/template/[template_id]/page.tsx`).

## Структура тестов

### `page.test.tsx`
Базовые unit-тесты для компонента:
- Рендеринг всех элементов интерфейса
- Взаимодействие с формами
- Валидация полей
- Обработка ошибок
- Навигация

### `page.integration.test.tsx`
Интеграционные тесты для полного workflow:
- Полный процесс создания шаблона
- Работа с несколькими днями недели
- Валидация данных
- Сохранение в базу данных
- Обработка ошибок

## Запуск тестов

```bash
# Запуск всех тестов
pnpm test

# Запуск только тестов этой страницы
pnpm test src/app/\(app\)/schedule/template/\[template_id\]/

# Запуск с покрытием
pnpm test --coverage

# Запуск в watch режиме
pnpm test --watch
```

## Покрытие тестами

Тесты покрывают:
- ✅ Рендеринг всех UI элементов
- ✅ Взаимодействие с формами
- ✅ Валидация данных
- ✅ API вызовы
- ✅ Обработка ошибок
- ✅ Навигация
- ✅ Состояния загрузки
- ✅ Полный workflow создания шаблона

## Моки

Тесты используют следующие моки:
- `@telegram-apps/sdk-react` - Telegram WebApp SDK
- `next/navigation` - Next.js навигация
- `@/lib/supabase` - Supabase клиент
- `@/hooks/useStudents` - Хук для работы с учениками
- `@/hooks/useLessonTemplates` - Хук для работы с шаблонами
- `@/components/ui/*` - UI компоненты

## Примеры тестов

### Базовый тест
```typescript
it('renders the page with all sections', async () => {
  render(
    <TestWrapper>
      <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
    </TestWrapper>
  );

  expect(screen.getByText('Настроить шаблон занятий')).toBeInTheDocument();
  expect(screen.getByText('Ученик')).toBeInTheDocument();
  // ... другие проверки
});
```

### Интеграционный тест
```typescript
it('completes full workflow: select student, subject, day, add time, and save', async () => {
  // 1. Select student
  // 2. Enter subject
  // 3. Select day
  // 4. Fill time details
  // 5. Save template
  // 6. Verify API was called
});
```

## Добавление новых тестов

При добавлении новых тестов следуйте этим принципам:

1. **Именование**: Используйте описательные имена тестов
2. **Группировка**: Группируйте связанные тесты в `describe` блоки
3. **Изоляция**: Каждый тест должен быть независимым
4. **Моки**: Используйте моки для внешних зависимостей
5. **Покрытие**: Стремитесь к 100% покрытию кода

## Отладка тестов

Если тест падает:

1. Проверьте моки - возможно, нужно обновить их
2. Убедитесь, что все зависимости правильно замокированы
3. Проверьте асинхронные операции - используйте `waitFor`
4. Проверьте селекторы элементов - возможно, они изменились
