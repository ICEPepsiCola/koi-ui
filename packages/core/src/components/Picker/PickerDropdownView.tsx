import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { ClearButton } from '../shared/ClearButton';
import type { PickerColumn, PickerOption } from './Picker';

export interface PickerDropdownViewProps {
  columns: PickerColumn[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

const CELL_H = 28;
const COL_H = 224;
const EMPTY_VALUE: string[] = [];

function getLabels(columns: PickerColumn[], values: string[]) {
  return values.map((val, idx) => {
    const opt = columns[idx]?.options.find((o) => o.value === val);
    return opt?.label ?? val;
  });
}

function defaultDraft(columns: PickerColumn[], value: string[]) {
  if (value.length) return [...value];
  return columns.map((c) => c.options.find((o) => !o.disabled)?.value ?? '');
}

/**
 * Desktop Picker — floating multi-column wheel panel (aligned with TimePicker).
 */
export function PickerDropdownView({
  columns,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = false,
}: PickerDropdownViewProps) {
  const { messages } = useKoiContext();
  const resolvedValue = value ?? EMPTY_VALUE;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(() =>
    defaultDraft(columns, resolvedValue),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef(columns);
  const display = useMemo(
    () => getLabels(columns, resolvedValue),
    [columns, resolvedValue],
  );
  const valueKey = resolvedValue.join('\0');
  const showClear = clearable && !disabled && resolvedValue.length > 0;

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // Sync draft only when opening or when controlled value changes — never on
  // fresh `columns={[...]}` identity from parent re-renders.
  useEffect(() => {
    if (!open) return;
    setDraft(defaultDraft(columnsRef.current, resolvedValue));
    // valueKey tracks controlled value content without [] identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, valueKey]);

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const confirm = () => {
    onChange?.(draft);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="koi-picker-demo relative w-full max-w-xs">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-sm',
          'transition-colors hover:border-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          open && 'border-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-left leading-none',
            display.length ? 'text-surface-foreground' : 'text-muted-foreground',
          )}
        >
          {display.length ? display.join(' ') : placeholder}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {showClear ? (
            <ClearButton
              label={messages.clearActionText}
              onClear={() => {
                onChange?.([]);
                setOpen(false);
              }}
            />
          ) : null}
          <span>▾</span>
        </span>
      </div>

      {open ? (
        <div
          data-picker-panel="desktop"
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-surface',
            'shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]',
          )}
        >
          <div className="flex">
            {columns.map((col, idx) => (
              <WheelColumnScroller
                key={idx}
                options={col.options}
                value={draft[idx] ?? ''}
                onChange={(val) => {
                  setDraft((prev) => {
                    const next = [...prev];
                    next[idx] = val;
                    return next;
                  });
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-end border-t border-border/80 px-3 py-2">
            <button
              type="button"
              className="h-7 rounded px-3 text-sm text-primary-foreground bg-primary transition-opacity hover:opacity-90"
              onClick={confirm}
            >
              确定
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WheelColumnScroller({
  options,
  value,
  onChange,
}: {
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const optionsKey = options.map((o) => o.value).join('\0');

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx < 0) return;
    const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
    const nextTop = Math.min(idx * CELL_H, maxScroll);
    if (Math.abs(root.scrollTop - nextTop) > 1) {
      root.scrollTop = nextTop;
    }
    // optionsKey tracks content identity without depending on array reference
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options read from closure when key/value change
  }, [value, optionsKey]);

  return (
    <div
      ref={scrollerRef}
      data-picker-column
      className={cn(
        'min-w-0 flex-1 overflow-y-auto overscroll-contain border-r border-border/70 last:border-r-0',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
      style={{ height: COL_H }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            className="flex w-full items-center justify-center"
            style={{ height: CELL_H }}
            onClick={() => {
              if (opt.disabled) return;
              onChange(opt.value);
            }}
          >
            <span
              className={cn(
                'flex h-6 w-[calc(100%-12px)] items-center justify-center rounded-sm text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-surface-foreground hover:bg-muted',
                opt.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
