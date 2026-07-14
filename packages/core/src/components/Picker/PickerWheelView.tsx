import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { PickerColumn } from './Picker';

export interface PickerWheelViewProps {
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

export function PickerWheelView({
  columns,
  value = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
}: PickerWheelViewProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(
    value.length ? value : columns.map((c) => c.options[0]?.value ?? ''),
  );
  const display = useMemo(() => getLabels(columns, value), [columns, value]);

  useScrollLock(open);

  const confirm = () => {
    onChange?.(draft);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen(true)}
      >
        <span className={display.length ? '' : 'text-muted-foreground'}>
          {display.length ? display.join(' ') : placeholder}
        </span>
        <span className="text-muted-foreground">▾</span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full rounded-t-lg bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <button type="button" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>
                取消
              </button>
              <span className="font-medium">{placeholder}</span>
              <button type="button" className="text-sm text-primary" onClick={confirm}>
                确定
              </button>
            </div>
            <div
              className="grid gap-2 px-4 py-4"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((col, idx) => (
                <div key={idx} className="max-h-48 overflow-y-auto rounded-md border border-border">
                  {col.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      className={cn(
                        'block w-full px-2 py-2 text-sm hover:bg-muted',
                        draft[idx] === opt.value && 'bg-muted font-medium text-primary',
                        opt.disabled && 'cursor-not-allowed opacity-50',
                      )}
                      onClick={() => {
                        const next = [...draft];
                        next[idx] = opt.value;
                        setDraft(next);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
