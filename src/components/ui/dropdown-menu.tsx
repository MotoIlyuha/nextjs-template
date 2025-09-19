'use client';

import * as React from 'react';
import { classNames } from '@/css/classnames';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return ctx;
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return <DropdownMenuContext.Provider value={{ open, setOpen }}>{children}</DropdownMenuContext.Provider>;
}

function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const { open, setOpen } = useDropdownMenuContext();
  const props = {
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(!open);
    },
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

function DropdownMenuContent({ children, align = 'end' }: { children: React.ReactNode; align?: 'start' | 'end' }) {
  const { open, setOpen } = useDropdownMenuContext();
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open, setOpen]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={classNames(
        'absolute top-full mt-2 z-50 min-w-[10rem] overflow-hidden rounded-md border tg-border p-1 shadow-md',
        'bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#111111)]',
        align === 'end' ? 'right-0' : 'left-0',
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className = '', onClick, children }: { className?: string; onClick?: () => void; children: React.ReactNode }) {
  const { setOpen } = useDropdownMenuContext();
  return (
    <button
      type="button"
      className={classNames('w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent',
        'hover:bg-[var(--tg-theme-secondary-bg-color,#f5f5f5)]', className)}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      role="menuitem"
    >
      <span className="inline-flex items-center">{children}</span>
    </button>
  );
}

function DropdownMenuSeparator() {
  return <div className="my-1 h-px border-t tg-border -mx-1" />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };


