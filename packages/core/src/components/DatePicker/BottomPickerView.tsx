import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { ClearButton } from '../shared/ClearButton';
import { Overlay } from '../shared/Overlay';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getDaysInMonth, pad2, parseDate } from './dateUtils';

export interface BottomPickerViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  clearable?: boolean;
}

function buildYears(min?: string, max?: string) {
  const current = new Date().getFullYear();
  const start = min ? Number(min.slice(0, 4)) : current - 50;
  const end = max ? Number(max.slice(0, 4)) : current + 50;
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

export function BottomPickerView({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  min,
  max,
  clearable = false,
}: BottomPickerViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const parsed = parseDate(value) ?? new Date();
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth() + 1);
  const [day, setDay] = useState(parsed.getDate());

  const years = buildYears(min, max);
  const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) =>
    pad2(i + 1),
  );
  const showClear = clearable && !disabled && Boolean(value);

  useScrollLock(open);

  useEffect(() => {
    if (day > days.length) setDay(days.length);
  }, [day, days.length]);

  useEffect(() => {
    if (!open) return;
    const next = parseDate(value) ?? new Date();
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setDay(next.getDate());
  }, [open, value]);

  const confirm = () => {
    const next = `${year}-${pad2(month)}-${pad2(day)}`;
    if (min && next < min) return;
    if (max && next > max) return;
    onChange?.(next);
    setOpen(false);
  };

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
        <span className={value ? '' : 'text-muted-foreground'}>
          {value ?? placeholder}
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
          <span>📅</span>
        </span>
      </div>
      {open ? (
        <Portal>
          <Overlay
            open
            onClick={() => setOpen(false)}
            className="flex items-end"
          >
            <div
              className="w-full rounded-t-2xl bg-surface pb-safe shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  className="text-sm text-muted-foreground"
                  onClick={() => setOpen(false)}
                >
                  取消
                </button>
                <span className="text-sm font-medium">{placeholder}</span>
                <button
                  type="button"
                  className="text-sm font-medium text-primary"
                  onClick={confirm}
                >
                  确定
                </button>
              </div>
              <div className="relative grid grid-cols-3 px-3 pb-5 pt-1">
                <div className="pointer-events-none absolute inset-x-3 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-lg bg-muted/70" />
                <WheelColumn
                  options={years.map(String)}
                  value={String(year)}
                  onChange={(v) => setYear(Number(v))}
                />
                <WheelColumn
                  options={Array.from({ length: 12 }, (_, i) => pad2(i + 1))}
                  value={pad2(month)}
                  onChange={(v) => setMonth(Number(v))}
                />
                <WheelColumn
                  options={days}
                  value={pad2(day)}
                  onChange={(v) => setDay(Number(v))}
                />
              </div>
            </div>
          </Overlay>
        </Portal>
      ) : null}
    </>
  );
}

function WheelColumn({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'center' });
  }, [value, options]);

  return (
    <div
      ref={scrollerRef}
      className="relative z-[2] h-48 snap-y snap-mandatory overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)',
      }}
    >
      <div className="h-[calc(50%-1.25rem)] shrink-0" />
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            data-active={active}
            className={cn(
              'flex h-10 w-full snap-center items-center justify-center text-base transition-colors',
              active
                ? 'font-semibold text-surface-foreground'
                : 'text-muted-foreground',
            )}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        );
      })}
      <div className="h-[calc(50%-1.25rem)] shrink-0" />
    </div>
  );
}
