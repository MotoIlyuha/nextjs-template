'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { LessonTemplateFormSchema, type LessonTemplateFormValues } from '@/schemas/lesson-template';
import type { Tables } from '@/types/supabase';

// Типы для шаблонов занятий
export type LessonTemplate = Tables<'lesson_templates'> & {
  students: {
    id: string;
    first_name: string;
    last_name: string | null;
    color: string | null;
  };
};

export type LessonTemplateWithStudent = LessonTemplate;

/**
 * useLessonTemplates — хук для получения списка шаблонов занятий текущего учителя.
 */
export function useLessonTemplates(teacherId: string): UseQueryResult<LessonTemplateWithStudent[]> {
  return useQuery<LessonTemplateWithStudent[]>({
    queryKey: ['lesson-templates', teacherId],
    enabled: Boolean(teacherId),
    queryFn: async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/lesson-templates', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lesson templates');
      }

      const result = await response.json();
      return result.templates as LessonTemplateWithStudent[];
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * useLessonTemplate — хук для получения конкретного шаблона занятия.
 */
export function useLessonTemplate(teacherId: string, templateId: string): UseQueryResult<LessonTemplateWithStudent> {
  return useQuery<LessonTemplateWithStudent>({
    queryKey: ['lesson-template', teacherId, templateId],
    enabled: Boolean(teacherId) && Boolean(templateId),
    queryFn: async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/lesson-templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lesson template');
      }

      const result = await response.json();
      return result.template as LessonTemplateWithStudent;
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * useCreateLessonTemplate — хук для создания шаблонов занятий.
 */
export function useCreateLessonTemplate(teacherId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-lesson-template', teacherId],
    mutationFn: async (values: LessonTemplateFormValues) => {
      const parsed = LessonTemplateFormSchema.safeParse(values);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(', '));
      }
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/lesson-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lesson templates');
      }

      const result = await response.json();
      return result.templates;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lesson-templates', teacherId] });
    },
  });
}

/**
 * useUpdateLessonTemplate — хук для обновления шаблона занятия.
 */
export function useUpdateLessonTemplate(teacherId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['update-lesson-template', teacherId],
    mutationFn: async ({ templateId, values }: { templateId: string; values: Partial<LessonTemplateFormValues> }) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const res = await fetch(`/api/lesson-templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update lesson template');
      }

      const result = await res.json();
      return result.template;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lesson-templates', teacherId] });
    },
  });
}

/**
 * useDeleteLessonTemplate — хук для удаления шаблона занятия.
 */
export function useDeleteLessonTemplate(teacherId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['delete-lesson-template', teacherId],
    mutationFn: async (templateId: string) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const res = await fetch(`/api/lesson-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete lesson template');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lesson-templates', teacherId] });
    },
  });
}
