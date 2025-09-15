'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StudentFormSchema, type StudentFormValues } from '@/schemas/student';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useCreateStudent } from '@/hooks/useCreateStudent';
import { useUIStore } from '@/stores/uiStore';

export interface StudentFormProps {
  teacherId: string;
  student?: Partial<StudentFormValues> & { id?: string };
}

/**
 * Форма создания/редактирования ученика.
 * - При наличии `student` — редактирование (пока только создание подключено).
 * - Валидация через Zod (`StudentFormSchema`).
 */
export function StudentForm({ teacherId, student }: StudentFormProps) {
  const mode: 'create' | 'edit' = student ? 'edit' : 'create';
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: {
      first_name: student?.first_name ?? '',
      last_name: student?.last_name ?? null,
      phone: student?.phone ?? null,
      email: student?.email ?? null,
      price_per_lesson: (student as any)?.price_per_lesson ?? 0,
      auto_pay: (student as any)?.auto_pay ?? false,
    },
  });

  const { mutate, isPending } = useCreateStudent({ teacherId });
  const { closeStudentForm } = useUIStore();

  const onSubmit = (values: StudentFormValues) => {
    const onSuccess = () => closeStudentForm();
    if (mode === 'create') mutate(values, { onSuccess });
    else mutate(values, { onSuccess });
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="first_name" rules={{}}>
          {(field) => (
            <FormItem>
              <label className="text-sm">Имя</label>
              <Input placeholder="Иван" {...field} />
              {form.formState.errors.first_name && (
                <p className="text-red-400 text-xs">{form.formState.errors.first_name.message}</p>
              )}
            </FormItem>
          )}
        </FormField>

        <FormField name="last_name">
          {(field) => (
            <FormItem>
              <label className="text-sm">Фамилия</label>
              <Input placeholder="Иванов" {...field} />
            </FormItem>
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="phone">
            {(field) => (
              <FormItem>
                <label className="text-sm">Телефон</label>
                <Input placeholder="+7..." {...field} />
              </FormItem>
            )}
          </FormField>
          <FormField name="email">
            {(field) => (
              <FormItem>
                <label className="text-sm">Email</label>
                <Input placeholder="email@example.com" type="email" {...field} />
              </FormItem>
            )}
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="price_per_lesson">
            {(field) => (
              <FormItem>
                <label className="text-sm">Цена за занятие</label>
                <Input type="number" step="1" min={0} {...field} />
              </FormItem>
            )}
          </FormField>
          <FormField name="auto_pay">
            {(field) => (
              <FormItem>
                <label className="text-sm">Автосписание</label>
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  <span className="text-sm opacity-80">Включить</span>
                </div>
              </FormItem>
            )}
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Сохраняем…' : mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default StudentForm;


