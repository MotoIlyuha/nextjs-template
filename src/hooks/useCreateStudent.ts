'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import type { TablesInsert } from '@/types/supabase';
import { StudentFormSchema, type StudentFormValues } from '@/schemas/student';

interface UseCreateStudentOptions {
  teacherId: string;
}

/**
 * useCreateStudent — хук для создания нового ученика.
 *
 * - Валидирует данные формы через Zod (`StudentFormSchema`).
 * - Создаёт запись в `students` с `teacher_id`.
 * - После успеха инвалидирует `['students', teacherId]`.
 */
export function useCreateStudent({ teacherId }: UseCreateStudentOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-student', teacherId],
    mutationFn: async (values: StudentFormValues) => {
      const parsed = StudentFormSchema.safeParse(values);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(', '));
      }
      const supabase = createClient();
      const payload: TablesInsert<'students'> = {
        ...parsed.data,
        teacher_id: teacherId,
      } as TablesInsert<'students'>;
      const { data, error } = await supabase.from('students').insert(payload).select('*').single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}


