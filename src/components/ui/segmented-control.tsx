'use client';

import * as React from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { classNames as cn } from '@/css/classnames';

const SegmentedControl = React.forwardRef<
  React.ElementRef<typeof ToggleGroup.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroup.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroup.Root
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 rounded-lg border border-white/20 bg-transparent p-1',
      className
    )}
    {...props}
  />
));
SegmentedControl.displayName = 'SegmentedControl';

const SegmentedControlItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroup.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroup.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroup.Item
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
      'data-[state=on]:bg-white/10 data-[state=on]:text-white data-[state=on]:border-white/60',
      'data-[state=off]:text-white/70 data-[state=off]:hover:text-white data-[state=off]:hover:bg-white/5',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
      className
    )}
    {...props}
  />
));
SegmentedControlItem.displayName = 'SegmentedControlItem';

export { SegmentedControl, SegmentedControlItem };
