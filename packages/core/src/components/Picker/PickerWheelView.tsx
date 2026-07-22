import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { PickerColumn, PickerOption } from './Picker';

export interface PickerWheelViewProps {
  columns: PickerColumn[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

const EMPTY_VALUE: string[] = [];
/** Matches `h-10` option rows; scrollTop ≈ index * ITEM_H when centered. */
const ITEM_H = 40;

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
                <div
                  className="relative grid px-2 pb-4"
                  style={{
                    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-3 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-lg bg-primary/10 ring-1 ring-primary/15" />
                  {columns.map((col, idx) => (
                    <WheelColumn
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
              </SheetChrome>
            </MotionPanel>
          </div>
        </Overlay>
      </Portal>
    </>
  );
}

function WheelColumn({
  options,
  value,
  onChange,
}: {
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const ignoreScrollRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsKey = options.map((o) => o.value).join('\0');

  useEffect(() => {
    optionsRef.current = options;
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx < 0) return;
    const nextTop = idx * ITEM_H;
    if (Math.abs(root.scrollTop - nextTop) <= 1) return;
    ignoreScrollRef.current = true;
    root.scrollTop = nextTop;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ignoreScrollRef.current = false;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionsKey tracks content
  }, [value, optionsKey]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const commitFromScroll = () => {
    const root = scrollerRef.current;
    if (!root || ignoreScrollRef.current) return;
    const idx = Math.round(root.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(optionsRef.current.length - 1, idx));
    const opt = optionsRef.current[clamped];
    if (!opt || opt.disabled) return;
    if (opt.value !== valueRef.current) {
      onChangeRef.current(opt.value);
    }
  };

  const scheduleCommit = () => {
    if (ignoreScrollRef.current) return;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(commitFromScroll, 80);
  };

  return (
    <div
      ref={scrollerRef}
      data-picker-column
      role="listbox"
      className="relative z-[2] h-48 touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
      }}
      onScroll={scheduleCommit}
    >
      <div className="h-[calc(50%-1.25rem)] shrink-0" aria-hidden />
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <div
            key={opt.value}
            role="option"
            aria-selected={active}
            data-active={active}
            aria-disabled={opt.disabled || undefined}
            className={cn(
              'flex h-10 w-full shrink-0 snap-center items-center justify-center text-base',
              controlTransition,
              active
                ? 'font-semibold text-surface-foreground'
                : 'text-muted-foreground',
              opt.disabled
                ? 'cursor-not-allowed opacity-40'
                : 'cursor-pointer',
            )}
            onClick={() => {
              if (opt.disabled) return;
              onChange(opt.value);
            }}
          >
            {opt.label}
          </div>
        );
      })}
      <div className="h-[calc(50%-1.25rem)] shrink-0" aria-hidden />
    </div>
  );
}
