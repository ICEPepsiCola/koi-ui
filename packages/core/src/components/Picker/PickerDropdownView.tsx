import { useEffect, useMemo, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { PickerWheels } from '../shared/PickerWheels';
import type { PickerColumn } from './Picker';

export interface PickerDropdownViewProps {
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
 * Desktop Picker — floating multi-column drum panel.
 */
export function PickerDropdownView({
  columns,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = false,
  size = 'md',
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
  const hasValue = display.length > 0;

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    if (!open) return;
    setDraft(defaultDraft(columnsRef.current, resolvedValue));
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
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
      />
      <FloatMenu
        open={open}
        data-picker-panel="desktop"
        className="overflow-hidden p-0"
      >
        <div className="px-1 pt-1">
          <PickerWheels
            density="compact"
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
        <div className="flex items-center justify-end gap-1 border-t border-border/70 px-2 py-2">
          <button
            type="button"
            className={cn(
              'h-8 rounded-field px-3 text-sm text-muted-foreground',
              controlTransition,
              pressable,
              'hover:bg-muted hover:text-surface-foreground',
            )}
            onClick={() => setOpen(false)}
          >
            {messages.cancelActionText}
          </button>
          <button
            type="button"
            className={cn(
              'h-8 rounded-field px-3.5 text-sm font-medium text-primary-foreground bg-primary shadow-field',
              controlTransition,
              focusRing,
              pressable,
              'hover:brightness-[1.04] active:brightness-[0.96]',
            )}
            onClick={confirm}
          >
            确定
          </button>
        </div>
      </FloatMenu>
    </div>
  );
}
