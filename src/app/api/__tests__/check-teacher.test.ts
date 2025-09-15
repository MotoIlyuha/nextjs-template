import { GET } from '@/app/api/check-teacher/route';

describe('GET /api/check-teacher', () => {
  it('returns 400 on missing user_id', async () => {
    const req = new Request('http://localhost/api/check-teacher');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});


