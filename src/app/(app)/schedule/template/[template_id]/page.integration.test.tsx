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
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
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

describe('TemplatePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  it('completes full workflow: select student, subject, day, add time, and save', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // 1. Select student
    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    fireEvent.change(studentSelect, { target: { value: 'student-1' } });

    // 2. Enter subject
    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    fireEvent.change(subjectInput, { target: { value: 'Математика' } });

    // 3. Select Monday
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    // 4. Wait for time settings to appear
    await waitFor(() => {
      expect(screen.getByText('Начало')).toBeInTheDocument();
    });

    // 5. Fill in time details
    const startTimeInput = screen.getByDisplayValue('');
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });

    const priceInput = screen.getByPlaceholderText('900');
    fireEvent.change(priceInput, { target: { value: '1000' } });

    // 6. Select duration preset
    const durationButton = screen.getByText('1 час');
    fireEvent.click(durationButton);

    // 7. Save the row (click check button)
    const saveRowButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(saveRowButton);

    // 8. Add note
    const noteInput = screen.getByPlaceholderText('Дополнительная информация о занятиях...');
    fireEvent.change(noteInput, { target: { value: 'Подготовка к ЕГЭ' } });

    // 9. Save template
    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    // 10. Verify API was called
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        studentId: 'student-1',
        subject: 'Математика',
        selectedDays: [1], // Monday
        timeRows: [
          {
            id: expect.any(String),
            startTime: '10:00',
            endTime: '11:00', // Should be calculated
            price: '1000',
            duration: 60,
          },
        ],
        note: 'Подготовка к ЕГЭ',
      });
    });
  });

  it('handles multiple days with different schedules', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Fill basic info
    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    fireEvent.change(studentSelect, { target: { value: 'student-1' } });

    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    fireEvent.change(subjectInput, { target: { value: 'Физика' } });

    // Monday schedule
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    });

    const priceInput = screen.getByPlaceholderText('900');
    fireEvent.change(priceInput, { target: { value: '1200' } });

    const saveRowButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(saveRowButton);

    // Wednesday schedule
    const wednesdayButton = screen.getByText('Ср');
    fireEvent.click(wednesdayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '14:00' } });
    });

    const wednesdayPriceInput = screen.getByPlaceholderText('900');
    fireEvent.change(wednesdayPriceInput, { target: { value: '1500' } });

    const wednesdaySaveButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(wednesdaySaveButton);

    // Save template
    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    // Should create separate templates for each day
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('validates required fields before saving', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Try to save without filling required fields
    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Сохраните хотя бы одно занятие перед сохранением шаблона')).toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('handles time calculation correctly', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Fill basic info
    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    fireEvent.change(studentSelect, { target: { value: 'student-1' } });

    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    fireEvent.change(subjectInput, { target: { value: 'Математика' } });

    // Select day and add time
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '10:30' } });
    });

    // Select 90 minutes duration
    const durationButton = screen.getByText('1.5 часа');
    fireEvent.click(durationButton);

    // Check that end time is calculated correctly
    const endTimeInput = screen.getByDisplayValue('12:00');
    expect(endTimeInput).toBeInTheDocument();

    const priceInput = screen.getByPlaceholderText('900');
    fireEvent.change(priceInput, { target: { value: '1500' } });

    const saveRowButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(saveRowButton);

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        studentId: 'student-1',
        subject: 'Математика',
        selectedDays: [1],
        timeRows: [
          {
            id: expect.any(String),
            startTime: '10:30',
            endTime: '12:00',
            price: '1500',
            duration: 90,
          },
        ],
        note: undefined,
      });
    });
  });

  it('handles error states gracefully', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Fill required fields
    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    fireEvent.change(studentSelect, { target: { value: 'student-1' } });

    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    fireEvent.change(subjectInput, { target: { value: 'Математика' } });

    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    });

    const priceInput = screen.getByPlaceholderText('900');
    fireEvent.change(priceInput, { target: { value: '1000' } });

    const saveRowButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(saveRowButton);

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Произошла ошибка при сохранении')).toBeInTheDocument();
    });
  });

  it('allows removing time rows', async () => {
    render(
      <TestWrapper>
        <TemplatePage params={Promise.resolve({ template_id: 'template-123' })} />
      </TestWrapper>
    );

    // Fill basic info
    const studentSelect = screen.getByDisplayValue('Выберите ученика');
    fireEvent.change(studentSelect, { target: { value: 'student-1' } });

    const subjectInput = screen.getByPlaceholderText('Например: Математика, Физика, Английский');
    fireEvent.change(subjectInput, { target: { value: 'Математика' } });

    // Select day and add time
    const mondayButton = screen.getByText('Пн');
    fireEvent.click(mondayButton);

    await waitFor(() => {
      const startTimeInput = screen.getByDisplayValue('');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    });

    const priceInput = screen.getByPlaceholderText('900');
    fireEvent.change(priceInput, { target: { value: '1000' } });

    const saveRowButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(saveRowButton);

    // Add another row
    const addButton = screen.getByText('Добавить занятие');
    fireEvent.click(addButton);

    // Remove the second row
    const removeButtons = screen.getAllByRole('button', { name: /minus/i });
    fireEvent.click(removeButtons[1]); // Remove second row

    // Save should only include the first row
    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        studentId: 'student-1',
        subject: 'Математика',
        selectedDays: [1],
        timeRows: [
          {
            id: expect.any(String),
            startTime: '10:00',
            endTime: '11:00',
            price: '1000',
            duration: 60,
          },
        ],
        note: undefined,
      });
    });
  });
});
