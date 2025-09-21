import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ColorPicker } from '../ui/color-picker';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ColorPicker', () => {
  const mockOnChange = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders color picker button', () => {
    render(
      <ColorPicker
        value="#FF6B6B"
        onChange={mockOnChange}
        onOpenChange={mockOnOpenChange}
      />
    );

    const colorButton = screen.getByRole('button', { name: 'Выбрать цвет' });
    expect(colorButton).toBeInTheDocument();
    expect(colorButton).toHaveStyle({ backgroundColor: '#FF6B6B' });
  });

  it('shows tooltip on first visit', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ColorPicker
        value="#FF6B6B"
        onChange={mockOnChange}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText('Выбери цвет ученика')).toBeInTheDocument();
  });

  it('hides tooltip after first click', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ColorPicker
        value="#FF6B6B"
        onChange={mockOnChange}
        onOpenChange={mockOnOpenChange}
      />
    );

    const colorButton = screen.getByRole('button', { name: 'Выбрать цвет' });
    fireEvent.click(colorButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('color-picker-tooltip-seen', 'true');
    expect(screen.queryByText('Выбери цвет ученика')).not.toBeInTheDocument();
  });

  it('opens color palette on click', async () => {
    render(
      <ColorPicker
        value="#FF6B6B"
        onChange={mockOnChange}
        onOpenChange={mockOnOpenChange}
      />
    );

    const colorButton = screen.getByRole('button', { name: 'Выбрать цвет' });
    fireEvent.click(colorButton);

    // Ждем завершения setTimeout
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange when predefined color is selected', async () => {
    render(
      <ColorPicker
        value="#FF6B6B"
        onChange={mockOnChange}
        onOpenChange={mockOnOpenChange}
      />
    );

    const colorButton = screen.getByRole('button', { name: 'Выбрать цвет' });
    fireEvent.click(colorButton);

    // Find and click a predefined color button
    const predefinedColorButton = screen.getByRole('button', { name: 'Выбрать цвет #4ECDC4' });
    fireEvent.click(predefinedColorButton);

    expect(mockOnChange).toHaveBeenCalledWith('#4ECDC4');
    
    // Ждем завершения анимации закрытия
    await new Promise(resolve => setTimeout(resolve, 350));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
