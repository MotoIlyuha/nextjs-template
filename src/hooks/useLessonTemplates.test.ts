import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  useCreateLessonTemplate,
  useUpdateLessonTemplate,
  useDeleteLessonTemplate,
  useLessonTemplates,
  useLessonTemplate,
} from './useLessonTemplates';

// Mock fetch
global.fetch = vi.fn();

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'teacher-123' } } },
      }),
    },
  })),
}));

// Test wrapper
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useLessonTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockClear();
  });

  describe('useCreateLessonTemplate', () => {
    it('creates lesson template successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ templates: [{ id: 'template-1' }] }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useCreateLessonTemplate(), {
        wrapper: TestWrapper,
      });

      const templateData = {
        studentId: 'student-123',
        subject: 'Математика',
        selectedDays: [1],
        timeRows: [
          {
            id: '1',
            startTime: '10:00',
            endTime: '11:00',
            price: '1000',
            duration: 60,
          },
        ],
        note: 'Подготовка к ЕГЭ',
      };

      await waitFor(async () => {
        await result.current.mutateAsync(templateData);
      });

      expect(fetch).toHaveBeenCalledWith('/api/lesson-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });
    });

    it('handles creation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Validation failed' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useCreateLessonTemplate(), {
        wrapper: TestWrapper,
      });

      const templateData = {
        studentId: 'student-123',
        subject: 'Математика',
        selectedDays: [1],
        timeRows: [
          {
            id: '1',
            startTime: '10:00',
            endTime: '11:00',
            price: '1000',
            duration: 60,
          },
        ],
      };

      await expect(result.current.mutateAsync(templateData)).rejects.toThrow();
    });
  });

  describe('useUpdateLessonTemplate', () => {
    it('updates lesson template successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ template: { id: 'template-1' } }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useUpdateLessonTemplate(), {
        wrapper: TestWrapper,
      });

      const updateData = {
        subject: 'Физика',
        price: 1200,
      };

      await waitFor(async () => {
        await result.current.mutateAsync({ id: 'template-1', data: updateData });
      });

      expect(fetch).toHaveBeenCalledWith('/api/lesson-templates/template-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('handles update errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Template not found' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useUpdateLessonTemplate(), {
        wrapper: TestWrapper,
      });

      const updateData = {
        subject: 'Физика',
      };

      await expect(
        result.current.mutateAsync({ id: 'template-1', data: updateData })
      ).rejects.toThrow();
    });
  });

  describe('useDeleteLessonTemplate', () => {
    it('deletes lesson template successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useDeleteLessonTemplate(), {
        wrapper: TestWrapper,
      });

      await waitFor(async () => {
        await result.current.mutateAsync('template-1');
      });

      expect(fetch).toHaveBeenCalledWith('/api/lesson-templates/template-1', {
        method: 'DELETE',
      });
    });

    it('handles delete errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Template not found' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useDeleteLessonTemplate(), {
        wrapper: TestWrapper,
      });

      await expect(result.current.mutateAsync('template-1')).rejects.toThrow();
    });
  });

  describe('useLessonTemplates', () => {
    it('fetches lesson templates successfully', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          subject: 'Математика',
          day_of_week: 1,
          start_time: '10:00',
          students: {
            id: 'student-1',
            first_name: 'Иван',
            last_name: 'Иванов',
            color: '#226095',
          },
        },
      ];

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ templates: mockTemplates }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useLessonTemplates(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTemplates);
      expect(fetch).toHaveBeenCalledWith('/api/lesson-templates');
    });

    it('handles fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useLessonTemplates(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useLessonTemplate', () => {
    it('fetches single lesson template successfully', async () => {
      const mockTemplate = {
        id: 'template-1',
        subject: 'Математика',
        day_of_week: 1,
        start_time: '10:00',
        students: {
          id: 'student-1',
          first_name: 'Иван',
          last_name: 'Иванов',
          color: '#226095',
        },
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ template: mockTemplate }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useLessonTemplate('template-1'), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTemplate);
      expect(fetch).toHaveBeenCalledWith('/api/lesson-templates/template-1');
    });

    it('handles single template fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Template not found' }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useLessonTemplate('template-1'), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
