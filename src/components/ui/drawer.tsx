'use client';

import * as React from 'react';
import { Drawer as VaulDrawer } from 'vaul';

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </VaulDrawer.Root>
  );
}

export interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

export function DrawerTrigger({ asChild, children, ...props }: DrawerTriggerProps) {
  const Comp: any = asChild ? (React.Children.only(children) as any).type : 'button';
  const childProps = asChild ? (React.Children.only(children) as any).props : {};
  return (
    <VaulDrawer.Trigger asChild={asChild}>
      <Comp {...childProps} {...props}>{asChild ? childProps.children : children}</Comp>
    </VaulDrawer.Trigger>
  );
}

export interface DrawerContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function DrawerContent({ className = '', children }: DrawerContentProps) {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <VaulDrawer.Content className={`max-h-[95%] fixed inset-x-0 bottom-0 z-50 mt-24 rounded-t-2xl tg-surface tg-border border p-4 ${className}`}>
        <div className="mx-auto w-full max-w-md">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/30" />
          {children}
        </div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}

export function DrawerBottomPanel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 bg-tg-surface/95 backdrop-blur-sm border-t tg-border border-t-white/10 p-4 pt-2 pb-3 -mx-4 -mb-4 rounded-t-2xl">
      {children}
    </div>
  );
}

export function DrawerHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-3 flex items-center justify-between">{children}</div>;
}

export function DrawerTitle({ children }: { children?: React.ReactNode }) {
  return <VaulDrawer.Title className="text-lg font-semibold">{children}</VaulDrawer.Title>;
}

export function DrawerDescription({ children }: { children?: React.ReactNode }) {
  return <VaulDrawer.Description className="text-sm opacity-70">{children}</VaulDrawer.Description>;
}

export function DrawerFooter({ children }: { children?: React.ReactNode }) {
  return <div className="mt-4 flex items-center justify-end gap-2">{children}</div>;
}

export interface DrawerCloseProps {
  asChild?: boolean;
  children?: React.ReactNode;
}

export function DrawerClose({ asChild, children }: DrawerCloseProps) {
  return (
    <VaulDrawer.Close asChild={asChild}>
      {children as React.ReactElement}
    </VaulDrawer.Close>
  );
}


