import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-md tg-border border bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)] px-3 text-sm outline-none placeholder:opacity-60 ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';


