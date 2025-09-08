import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tg-border border',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--tg-theme-button-color,#2ea6ff)] text-[var(--tg-theme-button-text-color,#fff)] hover:opacity-90 focus-visible:ring-[var(--tg-theme-link-color,#2ea6ff)]',
        outline:
          'bg-transparent text-[var(--tg-theme-text-color,#111)] hover:bg-[color-mix(in_oklab,var(--tg-theme-secondary-bg-color,#f5f5f5)_60%,transparent)]',
        secondary:
          'bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)] text-[var(--tg-theme-text-color,#111)] hover:opacity-90',
        destructive: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
    );
  },
);
Button.displayName = 'Button';


