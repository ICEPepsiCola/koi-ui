import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface CollapseItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface CollapseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CollapseItem[];
  defaultActiveKeys?: string[];
  activeKeys?: string[];
  onChange?: (keys: string[]) => void;
  accordion?: boolean;
}

export function Collapse({
  className,
  items,
  defaultActiveKeys = [],
  activeKeys: controlledKeys,
  onChange,
  accordion = false,
  ...props
}: CollapseProps) {
  const [internalKeys, setInternalKeys] = useState(defaultActiveKeys);
  const activeKeys = controlledKeys ?? internalKeys;

  const toggle = (key: string) => {
    let next: string[];
    if (accordion) {
      next = activeKeys.includes(key) ? [] : [key];
    } else {
      next = activeKeys.includes(key)
        ? activeKeys.filter((k) => k !== key)
        : [...activeKeys, key];
    }
    if (controlledKeys === undefined) setInternalKeys(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn('divide-y divide-border rounded-lg border border-border', className)}
      {...props}
    >
      {items.map((item) => {
        const open = activeKeys.includes(item.key);
        return (
          <div key={item.key}>
            <button
              type="button"
              disabled={item.disabled}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium',
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
              onClick={() => !item.disabled && toggle(item.key)}
              aria-expanded={open}
            >
              {item.label}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={cn(
                  'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                  open && 'rotate-180',
                )}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {open ? (
              <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                {item.children}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
