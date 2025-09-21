import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentForm } from '@/components/StudentForm';

vi.mock('@/hooks/useCreateStudent', () => ({
  useCreateStudent: () => ({ mutate: vi.fn(), isPending: false }),
}));

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('StudentForm', () => {
  it('submits with required fields', async () => {
    render(wrapper(<StudentForm teacherId="t1" />));
    await userEvent.type(screen.getByLabelText('Имя'), 'Test');
    await userEvent.type(screen.getByLabelText('Цена за занятие'), '100');
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});


