import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import type { PickerColumn, PickerOption } from './Picker';

export interface PickerDropdownViewProps {
  columns: PickerColumn[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

function getLabels(columns: PickerColumn[], values: string[]) {
  return values.map((val, idx) => {
    const opt = columns[idx]?.options.find((o) => o.value === val);
    return opt?.label ?? val;
  });
}

export function PickerDropdownView({
  columns,
  value = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
}: PickerDropdownViewProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(
    value.length ? value : columns.map((c) => c.options[0]?.value ?? ''),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const display = useMemo(() => getLabels(columns, value), [columns, value]);

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
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className={display.length ? '' : 'text-muted-foreground'}>
          {display.length ? display.join(' ') : placeholder}
        </span>
        <span className="text-muted-foreground">▾</span>
      </button>
      {open ? (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface p-3 shadow-md">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col, idx) => (
              <ColumnSelect
                key={idx}
                options={col.options}
                value={draft[idx]}
                onChange={(val) => {
                  const next = [...draft];
                  next[idx] = val;
                  setDraft(next);
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            onClick={confirm}
          >
            确定
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ColumnSelect({
  options,
  value,
  onChange,
}: {
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="max-h-40 overflow-y-auto rounded border border-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          className={cn(
            'block w-full px-2 py-1.5 text-sm hover:bg-muted',
            opt.value === value && 'bg-muted font-medium text-primary',
            opt.disabled && 'cursor-not-allowed opacity-50',
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
