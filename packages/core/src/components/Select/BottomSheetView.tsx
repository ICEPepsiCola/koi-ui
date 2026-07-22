import { useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { OptionRow } from '../shared/OptionRow';
import { Overlay } from '../shared/Overlay';
import { SheetChrome } from '../shared/SheetChrome';
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
  const hasValue = value !== undefined && value !== '' && Boolean(selected);

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
      <FieldTrigger
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={selected?.label}
        placeholder={resolvedPlaceholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.('');
          setOpen(false);
        }}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Portal>
        <Overlay open={open} onClick={() => setOpen(false)}>
          <div className="flex h-full items-end">
            <MotionPanel
              ref={sheetRef}
              variant="bottom"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="max-h-[70vh] w-full overflow-hidden rounded-t-box border border-border/80 bg-surface shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={<span id={titleId}>{resolvedPlaceholder}</span>}
                onCancel={() => setOpen(false)}
                cancelText={messages.cancelActionText}
                showConfirm={false}
              >
                <div className="max-h-[50vh] overflow-y-auto px-2 pb-3">
                  {options.map((opt) => (
                    <OptionRow
                      key={opt.value}
                      selected={opt.value === value}
                      disabled={opt.disabled}
                      className={cn('mb-0.5')}
                      onClick={() => {
                        if (opt.disabled) return;
                        onChange?.(opt.value);
                        setOpen(false);
                      }}
                    >
                      {opt.label}
                    </OptionRow>
                  ))}
                </div>
              </SheetChrome>
            </MotionPanel>
          </div>
        </Overlay>
      </Portal>
    </>
  );
}
