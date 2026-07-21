import { useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { ClearButton } from '../shared/ClearButton';
import { Overlay } from '../shared/Overlay';
import type { SelectOption } from './SelectView';

export interface BottomSheetViewProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function BottomSheetView({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  clearable = false,
}: BottomSheetViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const selected = options.find((o) => o.value === value);
  const resolvedPlaceholder = placeholder ?? messages.selectPlaceholder;
  const showClear = clearable && !disabled && value !== undefined && value !== '';

  useScrollLock(open);
  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    containerRef: sheetRef,
  });
  useFocusTrap({
    active: open,
    containerRef: sheetRef,
  });

  return (
    <>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected?.label ?? resolvedPlaceholder}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {showClear ? (
            <ClearButton
              label={messages.clearActionText}
              onClear={() => {
                onChange?.('');
                setOpen(false);
              }}
            />
          ) : null}
          <span>▾</span>
        </span>
      </div>
      {open ? (
        <Portal>
          <Overlay open onClick={() => setOpen(false)}>
            <div className="flex h-full items-end">
              <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="max-h-[70vh] w-full overflow-y-auto rounded-t-lg bg-surface"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  id={titleId}
                  className="border-b border-border px-4 py-3 text-center font-medium"
                >
                  {resolvedPlaceholder}
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
