'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveStudentRequest, deleteStudentRequest, updateStudentRequest } from '@students/api';

export function useArchiveStudent(teacherId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['archive-student', teacherId],
    mutationFn: async (studentId: string) => {
      await archiveStudentRequest(studentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}

export function useUpdateStudent(teacherId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-student', teacherId],
    mutationFn: async ({ studentId, values }: { studentId: string; values: any }) => {
      return await updateStudentRequest(studentId, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}

export function useDeleteStudent(teacherId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-student', teacherId],
    mutationFn: async (studentId: string) => {
      await deleteStudentRequest(studentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students', teacherId] });
    },
  });
}


