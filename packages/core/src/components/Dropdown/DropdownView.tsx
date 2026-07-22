import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  floatPanel,
  pressable,
} from '../../utils/interaction';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownViewProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  disabled?: boolean;
  onSelect?: (key: string) => void;
}

const placementClasses: Record<
  NonNullable<DropdownViewProps['placement']>,
  string
> = {
  'bottom-start': 'left-0 top-full mt-1',
  'bottom-end': 'right-0 top-full mt-1',
  'top-start': 'left-0 bottom-full mb-1',
  'top-end': 'right-0 bottom-full mb-1',
};

export function DropdownView({
  trigger,
  items,
  placement = 'bottom-start',
  disabled = false,
  onSelect,
}: DropdownViewProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(disabled && 'pointer-events-none opacity-50')}
      >
        {trigger}
      </div>
      {open ? (
        <ul
          role="menu"
          className={cn(
            'absolute z-50 min-w-40 overflow-hidden',
            floatPanel,
            placementClasses[placement],
          )}
        >
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn(
                  'block w-full px-3 py-2 text-left text-sm',
                  controlTransition,
                  pressable,
                  'hover:bg-muted',
                  item.disabled && 'cursor-not-allowed opacity-50',
                  item.danger && 'text-destructive hover:bg-destructive/10',
                )}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick?.();
                  onSelect?.(item.key);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
