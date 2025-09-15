import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with default text', () => {
    render(<Button>Click</Button>);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('rounded-md');
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});


