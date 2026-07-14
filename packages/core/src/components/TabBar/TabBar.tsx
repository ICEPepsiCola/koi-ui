import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const tabBarVariants = tv({
  base: 'fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface',
  variants: {
    safeArea: {
      true: 'pb-[env(safe-area-inset-bottom)]',
      false: '',
    },
  },
  defaultVariants: {
    safeArea: true,
  },
});

const tabItemVariants = tv({
  base: 'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
  variants: {
    active: {
      true: 'text-primary',
      false: 'text-muted-foreground',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
    disabled: false,
  },
});

export interface TabBarItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'>,
    VariantProps<typeof tabBarVariants> {
  items: TabBarItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

export function TabBar({
  items,
  activeKey: controlledKey,
  defaultActiveKey,
  onChange,
  safeArea,
  className,
  ...props
}: TabBarProps) {
  const [internalKey, setInternalKey] = useState(
    defaultActiveKey ?? items[0]?.key ?? '',
  );
  const activeKey = controlledKey ?? internalKey;

  const handleChange = (key: string) => {
    if (controlledKey === undefined) setInternalKey(key);
    onChange?.(key);
  };

  return (
    <nav
      className={cn(tabBarVariants({ safeArea }), className)}
      role="tablist"
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={item.key === activeKey}
          disabled={item.disabled}
          className={cn(
            tabItemVariants({
              active: item.key === activeKey,
              disabled: item.disabled,
            }),
          )}
          onClick={() => !item.disabled && handleChange(item.key)}
        >
          <span className="relative">
            {item.icon}
            {item.badge ? (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                {item.badge}
              </span>
            ) : null}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
