import {
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';

export const MENU_ITEM_H = 36;
export const MENU_COL_H = 216;

export interface MenuColumnOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface MenuColumnData {
  key?: string;
  options: MenuColumnOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface MenuColumnsProps {
  columns: MenuColumnData[];
  className?: string;
  /** Column viewport height in px. */
  height?: number;
}

/**
 * daisyUI-style multi-column scroll menus for desktop picker panels.
 */
export function MenuColumns({
  columns,
  className,
  height = MENU_COL_H,
}: MenuColumnsProps) {
  return (
    <div
      className={cn('grid divide-x divide-border/60', className)}
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((col, idx) => (
        <MenuColumn
          key={col.key ?? idx}
          options={col.options}
          value={col.value}
          onChange={col.onChange}
          height={height}
        />
      ))}
    </div>
  );
}

function MenuColumn({
  options,
  value,
  onChange,
  height,
}: {
  options: MenuColumnOption[];
  value: string;
  onChange: (value: string) => void;
  height: number;
}) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const optionsKey = options.map((o) => o.value).join('\0');

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx < 0) return;
    const selectedTop = idx * MENU_ITEM_H;
    const viewBottom = root.scrollTop + root.clientHeight;
    if (
      selectedTop < root.scrollTop ||
      selectedTop + MENU_ITEM_H > viewBottom
    ) {
      root.scrollTop = Math.max(0, selectedTop - (height - MENU_ITEM_H) / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionsKey tracks content
  }, [value, optionsKey, height]);

  return (
    <ul
      ref={scrollerRef}
      role="listbox"
      className="h-full overflow-y-auto overscroll-contain p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <li key={opt.value} className="list-none">
            <button
              type="button"
              role="option"
              aria-selected={active}
              disabled={opt.disabled}
              className={cn(
                'flex w-full items-center justify-center rounded-selector px-2 text-sm',
                controlTransition,
                active
                  ? 'bg-primary/12 font-semibold text-primary'
                  : 'font-normal text-surface-foreground/80 hover:bg-muted/70',
                opt.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
              )}
              style={{ height: MENU_ITEM_H }}
              onClick={() => {
                if (opt.disabled) return;
                onChange(opt.value);
              }}
            >
              <span className="truncate">{opt.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
