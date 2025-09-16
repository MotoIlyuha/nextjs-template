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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student');
      }

      const result = await response.json();
      return result.student;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}


