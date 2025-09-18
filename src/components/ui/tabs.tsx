'use client';

import * as React from 'react';

interface TabsContextType<T extends string> {
	activeValue: T;
	handleValueChange: (value: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsContext = React.createContext<TabsContextType<any> | undefined>(undefined);

function useTabs<T extends string = string>(): TabsContextType<T> {
	const ctx = React.useContext(TabsContext);
	if (!ctx) throw new Error('useTabs must be used within Tabs');
	return ctx;
}

type BaseTabsProps = React.ComponentProps<'div'> & { children: React.ReactNode };
type UncontrolledTabsProps<T extends string = string> = BaseTabsProps & { defaultValue?: T; value?: never; onValueChange?: never };
type ControlledTabsProps<T extends string = string> = BaseTabsProps & { value: T; onValueChange?: (value: T) => void; defaultValue?: never };
type TabsProps<T extends string = string> = UncontrolledTabsProps<T> | ControlledTabsProps<T>;

export function Tabs<T extends string = string>({ defaultValue, value, onValueChange, className, children, ...props }: TabsProps<T>) {
	const isControlled = value !== undefined;
	const [internal, setInternal] = React.useState<T | undefined>(defaultValue);
	const activeValue = (isControlled ? value : internal) as T;

	const handleValueChange = (val: T) => {
		if (isControlled) onValueChange?.(val);
		else setInternal(val);
	};

	return (
		<TabsContext.Provider value={{ activeValue, handleValueChange }}>
			<div className={`flex flex-col gap-2 min-w-0 ${className || ''}`} {...props}>{children}</div>
		</TabsContext.Provider>
	);
}

interface TabsListProps extends React.ComponentProps<'div'> { children: React.ReactNode }
export function TabsList({ className, children, ...props }: TabsListProps) {
	return (
		<div role="tablist" className={`relative bg-transparent inline-flex h-10 w-full items-center justify-center rounded-lg overflow-x-auto min-w-0 ${className || ''}`} {...props}>
			{children}
		</div>
	);
}

interface TabsTriggerProps extends React.ComponentProps<'button'> { value: string; children: React.ReactNode }
export function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
	const { activeValue, handleValueChange } = useTabs();
	const isActive = activeValue === value;
	return (
		<button
			type="button"
			role="tab"
			data-state={isActive ? 'active' : 'inactive'}
			onClick={() => handleValueChange(value)}
			className={`relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm transition-all duration-200 hover:bg-white/10 data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-white/70 ${className || ''}`}
			{...props}
		>
			{children}
			{isActive && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-in slide-in-from-bottom-1 duration-200" />
			)}
		</button>
	);
}

interface TabsContentsProps extends React.ComponentProps<'div'> { children: React.ReactNode; values: string[] }
export function TabsContents({ children, className, values, ...props }: TabsContentsProps) {
	const { activeValue, handleValueChange } = useTabs<string>();
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const startXRef = React.useRef<number | null>(null);
	const currentXRef = React.useRef<number>(0);
	const index = Math.max(0, values.indexOf(activeValue));

	React.useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		function onTouchStart(e: TouchEvent) {
			startXRef.current = e.touches[0].clientX;
			currentXRef.current = startXRef.current;
		}
		function onTouchMove(e: TouchEvent) {
			if (startXRef.current == null) return;
			currentXRef.current = e.touches[0].clientX;
		}
		function onTouchEnd() {
			if (startXRef.current == null) return;
			const delta = currentXRef.current - startXRef.current;
			const threshold = 50;
			if (Math.abs(delta) > threshold) {
				const dir = delta > 0 ? -1 : 1;
				const next = Math.min(values.length - 1, Math.max(0, index + dir));
				if (next !== index) handleValueChange(values[next] as any);
			}
			startXRef.current = null;
		}
		el.addEventListener('touchstart', onTouchStart, { passive: true });
		el.addEventListener('touchmove', onTouchMove, { passive: true });
		el.addEventListener('touchend', onTouchEnd);
		return () => {
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
		};
	}, [index, values, handleValueChange]);

	return (
		<div ref={containerRef} className={`overflow-hidden min-w-0 ${className || ''}`} {...props}>
			<div className="flex transition-transform duration-300" style={{ transform: `translateX(-${index * 100}%)` }}>
				{React.Children.map(children, (child) => (
					<div className="w-full shrink-0 min-w-0">
						{child}
					</div>
				))}
			</div>
		</div>
	);
}

interface TabsContentProps extends React.ComponentProps<'div'> { value: string; children: React.ReactNode }
export function TabsContent({ children, className, ...props }: TabsContentProps) {
	return (
		<div role="tabpanel" className={className} {...props}>
			{children}
		</div>
	);
}

export type { TabsProps };


