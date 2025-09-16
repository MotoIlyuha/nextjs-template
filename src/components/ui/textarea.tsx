'use client';

import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`min-h-[80px] w-full rounded-md tg-border border bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)] px-3 py-2 text-sm outline-none placeholder:opacity-60 ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';



