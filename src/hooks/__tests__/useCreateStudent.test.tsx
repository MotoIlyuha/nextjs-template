'use client';

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as supabaseLib from '@/lib/supabase';
import { useCreateStudent } from '@/hooks/useCreateStudent';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useCreateStudent', () => {
  it('creates student and invalidates list', async () => {
    const inserted = { id: '1' } as any;
    const mockFrom = {
      insert: () => ({ select: () => ({ single: async () => ({ data: inserted, error: null }) }) }),
    } as any;
    const invalidate = vi.fn();
    vi.spyOn(supabaseLib, 'createClient').mockReturnValue({ from: () => mockFrom } as any);

    const client = new QueryClient();
    vi.spyOn(client, 'invalidateQueries').mockImplementation(invalidate as any);

    const { result } = renderHook(() => useCreateStudent({ teacherId: 't1' }), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    result.current.mutate({ first_name: 'A', price_per_lesson: 10, auto_pay: false } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalled();
  });
});


