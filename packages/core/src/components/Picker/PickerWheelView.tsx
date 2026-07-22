import { useEffect, useMemo, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { PickerWheels } from '../shared/PickerWheels';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { PickerColumn } from './Picker';

export interface PickerWheelViewProps {
  columns: PickerColumn[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: FieldSize;
}

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
 * Mobile Picker — bottom sheet with multi-column wheels.
 */
export function PickerWheelView({
  columns,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = false,
  size = 'md',
}: PickerWheelViewProps) {
  const { messages } = useKoiContext();
  const resolvedValue = value ?? EMPTY_VALUE;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(() =>
    defaultDraft(columns, resolvedValue),
  );
  const columnsRef = useRef(columns);
  const display = useMemo(
    () => getLabels(columns, resolvedValue),
    [columns, resolvedValue],
  );
  const valueKey = resolvedValue.join('\0');
  const hasValue = display.length > 0;

  useScrollLock(open);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    if (!open) return;
    setDraft(defaultDraft(columnsRef.current, resolvedValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, valueKey]);

  const confirm = () => {
    onChange?.(draft);
    setOpen(false);
  };

  return (
    <>
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={display.join(' ')}
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.([]);
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
              variant="bottom"
              data-picker-panel="mobile"
              className="w-full rounded-t-box border border-border/80 bg-surface pb-safe shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={placeholder}
                onCancel={() => setOpen(false)}
                onConfirm={confirm}
                cancelText={messages.cancelActionText}
              >
                <div className="px-2 pb-5 pt-1">
                  <PickerWheels
                    mode="drum"
                    maxVisibleRows={5}
                    columns={columns.map((col, idx) => ({
                      key: String(idx),
                      options: col.options,
                      value: draft[idx] ?? '',
                      onChange: (val) => {
                        setDraft((prev) => {
                          const next = [...prev];
                          next[idx] = val;
                          return next;
                        });
                      },
                    }))}
                  />
                </div>
              </SheetChrome>
            </MotionPanel>
          </div>
        </Overlay>
      </Portal>
    </>
  );
}
