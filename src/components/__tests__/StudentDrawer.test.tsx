import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import StudentDrawer from '../StudentDrawer';

// Мокаем YandexMap компонент
vi.mock('../YandexMap', () => {
  return {
    default: function MockYandexMap({ address, className }: { address: string; className?: string }) {
      return (
        <div data-testid="yandex-map" className={className}>
          Карта: {address}
        </div>
      );
    },
  };
});

const mockStudent = {
  id: '1',
  first_name: 'Иван',
  last_name: 'Иванов',
  class_or_course: 5,
  is_online: true,
  color: '#3b82f6',
  note: 'Хороший ученик',
  address: 'Москва, Красная площадь, 1',
  student_contacts: [
    {
      id: '1',
      type: 'phone' as const,
      value: '+7 999 123 45 67',
    },
    {
      id: '2',
      type: 'email' as const,
      value: 'ivan@example.com',
    },
  ],
  student_relations: [
    {
      id: '1',
      relation_name: 'Мама',
      contact_type: 'phone' as const,
      contact_value: '+7 999 765 43 21',
    },
  ],
};

const defaultProps = {
  student: mockStudent,
  isOpen: true,
  onClose: vi.fn(),
  onEdit: vi.fn(),
  onArchive: vi.fn(),
  onDelete: vi.fn(),
};

describe('StudentDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('не рендерится когда student равен null', () => {
    render(<StudentDrawer {...defaultProps} student={null} />);
    
    expect(screen.queryByText('Иван Иванов')).not.toBeInTheDocument();
  });

  it('отображает информацию об ученике', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    expect(screen.getAllByText('Иван Иванов')).toHaveLength(3); // В заголовке и в контактах
    expect(screen.getByText('6 класс')).toBeInTheDocument();
    expect(screen.getByText('Онлайн')).toBeInTheDocument();
    expect(screen.getByText('Хороший ученик')).toBeInTheDocument();
  });

  it('отображает контакты ученика и родственников', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    expect(screen.getByText('+7 999 123 45 67')).toBeInTheDocument();
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Мама')).toBeInTheDocument();
    expect(screen.getByText('+7 999 765 43 21')).toBeInTheDocument();
  });

  it('отображает адрес и карту', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    expect(screen.getByText('Москва, Красная площадь, 1')).toBeInTheDocument();
    expect(screen.getByTestId('yandex-map')).toBeInTheDocument();
    expect(screen.getByText('Карта: Москва, Красная площадь, 1')).toBeInTheDocument();
  });

  it('отображает кнопки действий', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    expect(screen.getByText('Редактировать')).toBeInTheDocument();
    expect(screen.getByText('В архив')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('вызывает onEdit при клике на кнопку редактирования', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Редактировать'));
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockStudent);
  });

  it('вызывает onArchive при клике на кнопку архивирования', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    fireEvent.click(screen.getByText('В архив'));
    
    expect(defaultProps.onArchive).toHaveBeenCalledWith('1');
  });

  it('вызывает onDelete при клике на кнопку удаления', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Удалить'));
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('отображает правильный класс для ученика', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    expect(screen.getByText('6 класс')).toBeInTheDocument();
  });

  it('отображает правильный курс для студента', () => {
    const studentWithCourse = {
      ...mockStudent,
      class_or_course: 12, // Курс 2
    };
    
    render(<StudentDrawer {...defaultProps} student={studentWithCourse} />);
    
    expect(screen.getByText('Курс 2')).toBeInTheDocument();
  });

  it('не отображает класс когда он не задан', () => {
    const studentWithoutClass = {
      ...mockStudent,
      class_or_course: null,
    };
    
    render(<StudentDrawer {...defaultProps} student={studentWithoutClass} />);
    
    expect(screen.queryByText('6 класс')).not.toBeInTheDocument();
    expect(screen.queryByText('Курс')).not.toBeInTheDocument();
  });

  it('отображает правильный формат занятий', () => {
    const offlineStudent = {
      ...mockStudent,
      is_online: false,
    };
    
    render(<StudentDrawer {...defaultProps} student={offlineStudent} />);
    
    expect(screen.getByText('Очно')).toBeInTheDocument();
  });

  it('не отображает заметку когда она не задана', () => {
    const studentWithoutNote = {
      ...mockStudent,
      note: null,
    };
    
    render(<StudentDrawer {...defaultProps} student={studentWithoutNote} />);
    
    expect(screen.queryByText('Заметка')).not.toBeInTheDocument();
  });

  it('не отображает адрес когда он не задан', () => {
    const studentWithoutAddress = {
      ...mockStudent,
      address: null,
    };
    
    render(<StudentDrawer {...defaultProps} student={studentWithoutAddress} />);
    
    expect(screen.queryByText('Адрес')).not.toBeInTheDocument();
    expect(screen.queryByTestId('yandex-map')).not.toBeInTheDocument();
  });

  it('отображает кнопку "Проложить маршрут"', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    const routeButton = screen.getByText('Проложить маршрут');
    expect(routeButton).toBeInTheDocument();
  });

  it('открывает Yandex Maps при клике на кнопку маршрута', () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;
    
    render(<StudentDrawer {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Проложить маршрут'));
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%B0%D1%8F%20%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C%2C%201',
      '_blank'
    );
  });

  it('отображает правильный цвет ученика', () => {
    render(<StudentDrawer {...defaultProps} />);
    
    const colorSquare = screen.getByTestId('color-square');
    expect(colorSquare).toHaveStyle({ backgroundColor: '#3b82f6' });
  });
});
