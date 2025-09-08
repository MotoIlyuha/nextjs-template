import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`h-10 w-full rounded-md tg-border border bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)] px-3 text-sm outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';


