import { POST } from '@/app/api/students/route';

// Mock the Supabase helper
jest.mock('@/core/supabaseServer', () => ({
  getSupabaseForRequest: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-teacher-id' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-student-id', first_name: 'Test', last_name: 'Student' },
            error: null,
          }),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-student-id', first_name: 'Test', last_name: 'Student' },
            error: null,
          }),
        })),
      })),
    })),
  })),
}));

describe('POST /api/students', () => {
  it('creates a student with contacts and relations', async () => {
    const mockRequest = new Request('http://localhost/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        first_name: 'Иван',
        last_name: 'Иванов',
        is_online: true,
        color: '#226095',
        note: 'Тестовый ученик',
        contacts: [
          { type: 'phone', value: '+79123456789' },
          { type: 'email', value: 'ivan@example.com' },
        ],
        relations: [
          { relation_name: 'Мама', contact_type: 'phone', contact_value: '+79987654321' },
        ],
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.student).toBeDefined();
  });

  it('returns 400 for invalid data', async () => {
    const mockRequest = new Request('http://localhost/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        first_name: '', // Invalid: empty name
        last_name: 'Иванов',
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it('returns 401 for unauthorized request', async () => {
    // Mock unauthorized user
    const { getSupabaseForRequest } = require('@/core/supabaseServer');
    getSupabaseForRequest.mockReturnValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Unauthorized'),
        }),
      },
    });

    const mockRequest = new Request('http://localhost/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token',
      },
      body: JSON.stringify({
        first_name: 'Иван',
        last_name: 'Иванов',
        is_online: true,
        color: '#226095',
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });
});
