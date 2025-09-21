'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { StudentFormSchema, type StudentFormValues } from '@/schemas/student';
import type { StudentWithRelations, Student } from '@/types/student';

/**
 * useStudents — хук для получения списка учеников текущего учителя.
 */
export function useStudents(teacherId: string): UseQueryResult<StudentWithRelations[]> {
  return useQuery<StudentWithRelations[]>({
    queryKey: ['students', teacherId],
    enabled: Boolean(teacherId),
    queryFn: async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch students');
      }

      const result = await response.json();
      const list = result.students as StudentWithRelations[];
      return Array.isArray(list) ? list.filter((s) => !s.is_archived) : [];
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * useCreateStudent — хук для создания нового ученика.
 */
export function useCreateStudent(teacherId: string) {
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

/**
 * useUpdateStudent — хук для обновления ученика.
 */
export function useUpdateStudent(teacherId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['update-student', teacherId],
    mutationFn: async ({ studentId, values }: { studentId: string; values: Partial<StudentFormValues> }) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update student');
      }

      const result = await res.json();
      return result.student;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}

/**
 * useArchiveStudent — хук для архивирования ученика.
 */
export function useArchiveStudent(teacherId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['archive-student', teacherId],
    mutationFn: async (studentId: string) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_archived: true }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to archive student');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}

/**
 * useDeleteStudent — хук для удаления ученика.
 */
export function useDeleteStudent(teacherId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['delete-student', teacherId],
    mutationFn: async (studentId: string) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete student');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}