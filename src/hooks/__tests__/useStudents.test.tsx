'use client';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as supabaseLib from '@/lib/supabase';
import { useStudents } from '@/hooks/useStudents';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useStudents', () => {
  it('returns data from supabase', async () => {
    const mockFrom = {
      select: () => mockFrom,
      eq: async () => ({ data: [{ id: '1', first_name: 'A', price_per_lesson: 10, teacher_id: 't1', auto_pay: null, created_at: null, email: null, last_name: null, phone: null }], error: null }),
    } as any;
    vi.spyOn(supabaseLib, 'createClient').mockReturnValue({ from: () => mockFrom } as any);

    const { result } = renderHook(() => useStudents('t1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.first_name).toBe('A');
  });

  it('throws on error', async () => {
    const mockFrom = {
      select: () => mockFrom,
      eq: async () => ({ data: null, error: { message: 'boom' } }),
    } as any;
    vi.spyOn(supabaseLib, 'createClient').mockReturnValue({ from: () => mockFrom } as any);

    const { result } = renderHook(() => useStudents('t1'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});


