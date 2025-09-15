import { POST } from '@/app/api/register-teacher/route';

describe('POST /api/register-teacher', () => {
  it('returns 415 when content-type is invalid', async () => {
    const req = new Request('http://localhost/api/register-teacher', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(415);
  });
});


