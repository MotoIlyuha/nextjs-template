'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';

export type Student = Tables<'students'>;

/**
 * useStudents — хук для получения списка учеников текущего учителя.
 *
 * - Использует React Query (@tanstack/react-query) для кеширования и статусов.
 * - Выполняет типизированный запрос к Supabase: `students` по `teacher_id`.
 * - Возвращает данные, состояние загрузки и ошибку.
 *
 * @param teacherId ID текущего учителя (равен auth.uid()).
 * @returns UseQueryResult<Student[]> — данные, статусы и ошибки запроса.
 */
export function useStudents(teacherId: string): UseQueryResult<Student[]> {
  return useQuery<Student[]>({
    queryKey: ['students', teacherId],
    enabled: Boolean(teacherId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId);
      if (error) throw new Error(error.message);
      return data as Student[];
    },
    staleTime: 30_000,
    retry: 1,
  });
}


