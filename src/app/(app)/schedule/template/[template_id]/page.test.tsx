import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TemplatePage from './page';

// Mock dependencies
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
      {
        id: 'student-2',
        first_name: 'Мария',
        last_name: 'Петрова',
        color: '#ff6b6b',
        is_archived: false,
      },
    ],
    isLoading: false,
  })),
}));

const mockMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useLessonTemplates', () => ({
  useCreateLessonTemplate: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
  })),
}));

// Mock components
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

describe('TemplatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page with all sections', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
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

  it('displays student selection dropdown', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    expect(studentSelect).toBeInTheDocument();

    // Check if students are available in dropdown
    fireEvent.click(studentSelect);
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });
  });

  it('allows subject input', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    expect(subjectInput).toBeInTheDocument();

    fireEvent.change(subjectInput, { target: { value: 'Математика' } });
    expect(subjectInput).toHaveValue('Математика');
  });

  it('displays days of week buttons', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const dayButtons = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayButtons.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('allows selecting days of week', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    // After clicking a day, time settings should appear
    await waitFor(() => {
      expect(screen.getByText('Начало')).toBeInTheDocument();
      expect(screen.getByText('Окончание')).toBeInTheDocument();
      expect(screen.getByText('Стоимость (₽)')).toBeInTheDocument();
    });
  });

  it('allows adding time rows', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Select a day first
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const addButton = screen.getByText('Добавить занятие');
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByText('Добавить занятие');
    fireEvent.click(addButton);

    // Should have multiple time input rows now
    const timeInputs = screen.getAllByDisplayValue('');
    expect(timeInputs.length).toBeGreaterThan(1);
  });

  it('validates time inputs', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Select a day and fill in time
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
      expect(startTimeInput).toHaveValue('10:00');
    });
  });

  it('allows setting duration presets', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Select a day first
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const durationButtons = ['45 минут', '1 час', '1.5 часа'];
      durationButtons.forEach(duration => {
        expect(screen.getByText(duration)).toBeInTheDocument();
      });
    });
  });

  it('allows price input with validation', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Select a day first
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const priceInput = screen.getByPlaceholderText('900');
      expect(priceInput).toBeInTheDocument();
      expect(priceInput).toHaveAttribute('min', '0');
      expect(priceInput).toHaveAttribute('max', '10000');
      expect(priceInput).toHaveAttribute('step', '50');
    });
  });

  it('allows note input', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const noteInput = screen.getByPlaceholderText('Дополнительная информация о занятиях...');
    expect(noteInput).toBeInTheDocument();

    fireEvent.change(noteInput, { target: { value: 'Подготовка к ЕГЭ' } });
    expect(noteInput).toHaveValue('Подготовка к ЕГЭ');
  });

  it('shows save button with correct text', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Сохранить');
    expect(saveButton).toBeInTheDocument();
  });

  it('shows delete button', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const deleteButton = screen.getByText('Удалить');
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles back navigation', async () => {
    const mockBack = vi.fn();
    const mockUseRouter = vi.fn(() => ({
      back: mockBack,
      push: vi.fn(),
      replace: vi.fn(),
    }));
    
    vi.doMock('next/navigation', () => ({
      useRouter: mockUseRouter,
    }));

    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const backButton = screen.getByRole('button', { name: /arrow/i });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('displays error messages when validation fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Validation failed'));

    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Произошла ошибка при сохранении')).toBeInTheDocument();
    });
  });

  it('shows loading state during save', async () => {
    mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Fill required fields
    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    fireEvent.change(subjectInput, { target: { value: 'Математика' } });

    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    fireEvent.change(studentSelect, { target: { value: 'student-1' } });

    // Select a day and add time
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    });

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Сохранение...')).toBeInTheDocument();
    });
  });
});
