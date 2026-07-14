import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';
import type { SelectOption } from './SelectView';

export interface BottomSheetViewProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BottomSheetView({
  options,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
}: BottomSheetViewProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  useScrollLock(open);

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
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected?.label ?? placeholder}
        </span>
        <span className="text-muted-foreground">▾</span>
      </button>
      {open ? (
        <Portal>
          <Overlay open onClick={() => setOpen(false)}>
            <div className="flex h-full items-end">
              <div
                className="max-h-[70vh] w-full overflow-y-auto rounded-t-lg bg-surface"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-border px-4 py-3 text-center font-medium">
                  {placeholder}
                </div>
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    className={cn(
                      'block w-full px-4 py-3 text-left text-sm hover:bg-muted',
                      opt.value === value && 'bg-muted font-medium',
                      opt.disabled && 'cursor-not-allowed opacity-50',
                    )}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange?.(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Overlay>
        </Portal>
      ) : null}
    </>
  );
}
