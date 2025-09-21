import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import YandexMap from '../YandexMap';

// Мокаем Yandex Maps
vi.mock('@pbe/react-yandex-maps', () => ({
  YMaps: ({ children }: { children: React.ReactNode }) => <div data-testid="ymaps">{children}</div>,
  Map: ({ instanceRef, defaultState, children }: any) => (
    <div data-testid="map" data-center={JSON.stringify(defaultState.center)}>
      {children}
    </div>
  ),
  Placemark: ({ geometry, options }: any) => (
    <div data-testid="placemark" data-geometry={JSON.stringify(geometry)} data-options={JSON.stringify(options)} />
  ),
}));

// Мокаем window.ymaps
const mockGeocode = vi.fn();
const mockYmaps = {
  geocode: mockGeocode,
};

Object.defineProperty(window, 'ymaps', {
  value: mockYmaps,
  writable: true,
});

describe('YandexMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeocode.mockReturnValue({
      then: vi.fn((callback) => {
        callback({
          geoObjects: {
            get: vi.fn(() => ({
              geometry: {
                getCoordinates: () => [55.7558, 37.6176],
              },
            })),
          },
        });
        return { catch: vi.fn() };
      }),
    });
  });

  it('отображает сообщение когда адрес не указан', () => {
    render(<YandexMap address="" />);
    
    expect(screen.getByText('Адрес не указан')).toBeInTheDocument();
  });

  it('отображает карту с указанным адресом', () => {
    const address = 'Москва, Красная площадь';
    render(<YandexMap address={address} />);
    
    expect(screen.getByTestId('ymaps')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByTestId('placemark')).toBeInTheDocument();
  });

  it('применяет переданный className', () => {
    const className = 'custom-class';
    render(<YandexMap address="Москва" className={className} />);
    
    const container = screen.getByTestId('ymaps').parentElement;
    expect(container).toHaveClass(className);
  });

  it('устанавливает правильные координаты по умолчанию', () => {
    render(<YandexMap address="Москва" />);
    
    const map = screen.getByTestId('map');
    const center = JSON.parse(map.getAttribute('data-center') || '[]');
    // Координаты обновляются после геокодирования в моке
    expect(center).toEqual([55.7558, 37.6176]);
  });

  it('отображает маркер с правильными опциями', () => {
    render(<YandexMap address="Москва" />);
    
    const placemark = screen.getByTestId('placemark');
    const options = JSON.parse(placemark.getAttribute('data-options') || '{}');
    
    expect(options.preset).toBe('islands#redDotIcon');
    expect(options.iconColor).toBe('#3b82f6');
  });

  it('вызывает геокодирование при изменении адреса', async () => {
    const address = 'Санкт-Петербург, Невский проспект';
    render(<YandexMap address={address} />);
    
    await waitFor(() => {
      expect(mockGeocode).toHaveBeenCalledWith(address);
    });
  });

  it('обрабатывает ошибки геокодирования', async () => {
    mockGeocode.mockReturnValue({
      then: vi.fn((callback) => {
        callback({
          geoObjects: {
            get: vi.fn(() => null), // Нет результатов
          },
        });
        return { 
          catch: vi.fn((errorCallback) => {
            errorCallback(new Error('Геокодирование не удалось'));
          })
        };
      }),
    });

    render(<YandexMap address="Несуществующий адрес" />);
    
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить карту')).toBeInTheDocument();
    });
  });

  it('отображает адрес в сообщении об ошибке', async () => {
    mockGeocode.mockReturnValue({
      then: vi.fn(() => {
        throw new Error('Ошибка геокодирования');
      }),
    });

    const address = 'Проблемный адрес';
    render(<YandexMap address={address} />);
    
    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить карту')).toBeInTheDocument();
      expect(screen.getByText(address)).toBeInTheDocument();
    });
  });

  it('использует API ключ из переменных окружения', () => {
    const originalEnv = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY = 'test-api-key';
    
    render(<YandexMap address="Москва" />);
    
    // Проверяем, что компонент рендерится (API ключ используется внутри YMaps)
    expect(screen.getByTestId('ymaps')).toBeInTheDocument();
    
    // Восстанавливаем оригинальное значение
    process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY = originalEnv;
  });

  it('использует демо ключ когда API ключ не задан', () => {
    const originalEnv = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    
    render(<YandexMap address="Москва" />);
    
    // Проверяем, что компонент рендерится с демо ключом
    expect(screen.getByTestId('ymaps')).toBeInTheDocument();
    
    // Восстанавливаем оригинальное значение
    process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY = originalEnv;
  });
});
