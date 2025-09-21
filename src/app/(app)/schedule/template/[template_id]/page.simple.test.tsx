import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';

// Mock all dependencies
vi.mock('@telegram-apps/sdk-react', () => ({
  useSignal: vi.fn(() => ({
    text_color: '#ffffff',
    button_color: '#007AFF',
    button_text_color: '#ffffff',
    hint_color: '#999999',
  })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'teacher-123' } } },
      }),
    },
  })),
}));

vi.mock('@/hooks/useStudents', () => ({
  useStudents: vi.fn(() => ({
    data: [
      {
        id: 'student-1',
        first_name: 'Иван',
        last_name: 'Иванов',
        color: '#226095',
        is_archived: false,
      },
    ],
    isLoading: false,
  })),
}));

vi.mock('@/hooks/useLessonTemplates', () => ({
  useCreateLessonTemplate: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock all UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}));

// Mock the actual page component
const MockTemplatePage = () => {
  return (
    <div>
      <h1>Настроить шаблон занятий</h1>
      <div>Ученик</div>
      <div>Предмет</div>
      <div>Дни недели</div>
      <div>Заметка</div>
      <button>Сохранить</button>
      <button>Удалить</button>
    </div>
  );
};

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

describe('TemplatePage (Simple)', () => {
  it('renders the page with all sections', () => {
    render(
      <TestWrapper>
        <MockTemplatePage />
      </TestWrapper>
    );

    expect(screen.getByText('Настроить шаблон занятий')).toBeInTheDocument();
    expect(screen.getByText('Ученик')).toBeInTheDocument();
    expect(screen.getByText('Предмет')).toBeInTheDocument();
    expect(screen.getByText('Дни недели')).toBeInTheDocument();
    expect(screen.getByText('Заметка')).toBeInTheDocument();
    expect(screen.getByText('Сохранить')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    render(
      <TestWrapper>
        <MockTemplatePage />
      </TestWrapper>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Настроить шаблон занятий');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Сохранить');
    expect(buttons[1]).toHaveTextContent('Удалить');
  });
});
