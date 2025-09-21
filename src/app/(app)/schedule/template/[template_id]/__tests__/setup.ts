import { vi } from 'vitest';

// Mock Telegram WebApp
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initData: 'test_init_data',
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
        },
      },
      themeParams: {
        text_color: '#ffffff',
        button_color: '#007AFF',
        button_text_color: '#ffffff',
        hint_color: '#999999',
      },
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn(),
      MainButton: {
        text: 'Test Button',
        color: '#007AFF',
        textColor: '#ffffff',
        isVisible: false,
        isActive: false,
        show: vi.fn(),
        hide: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        onClick: vi.fn(),
        offClick: vi.fn(),
      },
      BackButton: {
        isVisible: false,
        show: vi.fn(),
        hide: vi.fn(),
        onClick: vi.fn(),
        offClick: vi.fn(),
      },
    },
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
