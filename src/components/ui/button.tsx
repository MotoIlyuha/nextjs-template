import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-600',
  outline: 'border border-white/20 bg-transparent text-white hover:bg-white/10',
  secondary: 'bg-white/10 text-white hover:bg-white/20',
  destructive: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-6',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
    return <button ref={ref} className={cls} {...props} />;
  },
);
Button.displayName = 'Button';


