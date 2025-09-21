import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const Select = RadixSelect.Root;

export const SelectGroup = RadixSelect.Group;

export const SelectValue = RadixSelect.Value;

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm outline-none',
      'bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)] border-[color:var(--tg-theme-hint-color,#e5e5e5)]',
      'data-[state=open]:ring-1 data-[state=open]:ring-[var(--tg-theme-accent-text-color,#2481cc)]',
      className,
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon>
      <ChevronDown className="h-4 w-4 opacity-70" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = RadixSelect.Trigger.displayName;

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 text-sm shadow-md',
        'bg-[var(--tg-theme-bg-color,#ffffff)] border-[color:var(--tg-theme-hint-color,#e5e5e5)]',
        className,
      )}
      position="popper"
      sideOffset={6}
      {...props}
    >
      <RadixSelect.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
        <ChevronUp className="h-4 w-4" />
      </RadixSelect.ScrollUpButton>
      <RadixSelect.Viewport className="p-1">
        {children}
      </RadixSelect.Viewport>
      <RadixSelect.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
        <ChevronDown className="h-4 w-4" />
      </RadixSelect.ScrollDownButton>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = RadixSelect.Content.displayName;

export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Label>
>(({ className, ...props }, ref) => (
  <RadixSelect.Label ref={ref} className={cn('px-2 py-1.5 text-xs opacity-70', className)} {...props} />
));
SelectLabel.displayName = RadixSelect.Label.displayName;

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-2 pl-8 pr-2 text-sm outline-none',
      'focus:bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)]',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center">
      <RadixSelect.ItemIndicator>
        <Check className="h-4 w-4" />
      </RadixSelect.ItemIndicator>
    </span>
    <RadixSelect.ItemText key={props.value}>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
));
SelectItem.displayName = RadixSelect.Item.displayName;

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Separator>
>(({ className, ...props }, ref) => (
  <RadixSelect.Separator ref={ref} className={cn('my-1 h-px bg-[color:var(--tg-theme-hint-color,#e5e5e5)]', className)} {...props} />
));
SelectSeparator.displayName = RadixSelect.Separator.displayName;


