import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/api-utils', () => ({
  handleApiError: vi.fn((error) => new Response(JSON.stringify({ error: error.message }), { status: 500 })),
  successResponse: vi.fn((data, status = 200) => new Response(JSON.stringify(data), { status })),
  validateRequestBody: vi.fn(),
  getAuthenticatedUser: vi.fn(),
}));

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [{ id: 'template-1', subject: 'Математика' }],
        error: null,
      })),
    })),
  })),
};

const mockUser = { id: 'teacher-123' };

describe('/api/lesson-templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const { getAuthenticatedUser } = require('@/lib/api-utils');
    getAuthenticatedUser.mockResolvedValue({ user: mockUser, supabase: mockSupabase });
  });

  describe('GET', () => {
    it('returns lesson templates for authenticated user', async () => {
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

      mockSupabase.from().select().eq().eq().order().order.mockResolvedValue({
        data: mockTemplates,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/lesson-templates');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledWith('lesson_templates');
    });

    it('handles database errors', async () => {
      mockSupabase.from().select().eq().eq().order().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost/api/lesson-templates');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    it('creates lesson templates successfully', async () => {
      const mockFormData = {
        studentId: 'student-123',
        subject: 'Математика',
        selectedDays: [1, 3], // Monday, Wednesday
        timeRows: [
          {
            id: '1',
            startTime: '10:00',
            endTime: '11:00',
            price: '1000',
            duration: 60,
          },
          {
            id: '2',
            startTime: '14:00',
            endTime: '15:00',
            price: '1200',
            duration: 60,
          },
        ],
        note: 'Подготовка к ЕГЭ',
      };

      const { validateRequestBody } = require('@/lib/api-utils');
      validateRequestBody.mockResolvedValue(mockFormData);

      // Mock student verification
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: { id: 'student-123' },
        error: null,
      });

      // Mock template creation
      mockSupabase.from().insert().select.mockResolvedValue({
        data: [
          { id: 'template-1', subject: 'Математика', day_of_week: 1 },
          { id: 'template-2', subject: 'Математика', day_of_week: 3 },
        ],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/lesson-templates', {
        method: 'POST',
        body: JSON.stringify(mockFormData),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([
        {
          teacher_id: 'teacher-123',
          student_id: 'student-123',
          subject: 'Математика',
          duration_minutes: 60,
          day_of_week: 1,
          start_time: '10:00',
          price: 1000,
          note: 'Подготовка к ЕГЭ',
          is_active: true,
        },
        {
          teacher_id: 'teacher-123',
          student_id: 'student-123',
          subject: 'Математика',
          duration_minutes: 60,
          day_of_week: 1,
          start_time: '14:00',
          price: 1200,
          note: 'Подготовка к ЕГЭ',
          is_active: true,
        },
        {
          teacher_id: 'teacher-123',
          student_id: 'student-123',
          subject: 'Математика',
          duration_minutes: 60,
          day_of_week: 3,
          start_time: '10:00',
          price: 1000,
          note: 'Подготовка к ЕГЭ',
          is_active: true,
        },
        {
          teacher_id: 'teacher-123',
          student_id: 'student-123',
          subject: 'Математика',
          duration_minutes: 60,
          day_of_week: 3,
          start_time: '14:00',
          price: 1200,
          note: 'Подготовка к ЕГЭ',
          is_active: true,
        },
      ]);
    });

    it('returns 404 when student not found', async () => {
      const mockFormData = {
        studentId: 'nonexistent-student',
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

      const { validateRequestBody } = require('@/lib/api-utils');
      validateRequestBody.mockResolvedValue(mockFormData);

      // Mock student not found
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const request = new NextRequest('http://localhost/api/lesson-templates', {
        method: 'POST',
        body: JSON.stringify(mockFormData),
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
    });

    it('handles template creation errors', async () => {
      const mockFormData = {
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

      const { validateRequestBody } = require('@/lib/api-utils');
      validateRequestBody.mockResolvedValue(mockFormData);

      // Mock student verification
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: { id: 'student-123' },
        error: null,
      });

      // Mock template creation error
      mockSupabase.from().insert().select.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      const request = new NextRequest('http://localhost/api/lesson-templates', {
        method: 'POST',
        body: JSON.stringify(mockFormData),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
