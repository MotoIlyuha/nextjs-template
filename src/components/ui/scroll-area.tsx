'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

export interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  children?: React.ReactNode;
  className?: string;
}

export function ScrollArea({ className = '', children, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root className={`relative ${className}`} {...props}>
      <ScrollAreaPrimitive.Viewport className="size-full rounded-[inherit] outline-none">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

export interface ScrollBarProps extends React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {}

export function ScrollBar({ className = '', orientation = 'vertical', ...props }: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation={orientation}
      className={`flex touch-none select-none p-px transition-colors ${
        orientation === 'vertical' ? 'h-full w-2.5 border-l border-l-transparent' : 'h-2.5 flex-col border-t border-t-transparent'
      } ${className}`}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}


