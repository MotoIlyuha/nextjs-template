import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentForm } from './StudentForm';

describe('StudentForm', () => {
  it('renders required fields and submits', async () => {
    render(<StudentForm teacherId="t1" />);

    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
    expect(screen.getByLabelText('Фамилия')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Иван' } });
    fireEvent.change(screen.getByLabelText('Фамилия'), { target: { value: 'Иванов' } });

    fireEvent.click(screen.getByRole('button', { name: /создать|сохранить/i }));
  });

  it('toggles address when is_online is unchecked', () => {
    render(<StudentForm teacherId="t1" />);
    const onlineToggle = screen.getByText('Онлайн').closest('div')!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(onlineToggle.checked).toBe(true);
    fireEvent.click(onlineToggle);
    expect(screen.getByLabelText('Адрес')).toBeInTheDocument();
  });

  it('adds and removes contacts and relations', () => {
    render(<StudentForm teacherId="t1" />);

    fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));
    const typeSelect = screen.getByLabelText('Тип') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'Telegram' } });
    const valueInput = screen.getByLabelText('Значение') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '@user' } });

    // Relations block add
    const addButtons = screen.getAllByRole('button', { name: /Добавить/i });
    fireEvent.click(addButtons[1]);
    expect(screen.getByLabelText('Кто')).toBeInTheDocument();
    expect(screen.getByLabelText('Контакт')).toBeInTheDocument();
  });
});


