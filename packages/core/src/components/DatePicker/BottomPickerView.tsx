import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { SheetChrome } from '../shared/SheetChrome';
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
  const hasValue = Boolean(value);

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
      <FieldTrigger
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={value}
        placeholder={placeholder}
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
              variant="bottom"
              className="w-full rounded-t-box border border-border/80 bg-surface pb-safe shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={placeholder}
                onCancel={() => setOpen(false)}
                onConfirm={confirm}
                cancelText={messages.cancelActionText}
              >
                <div className="relative grid grid-cols-3 px-3 pb-5 pt-1">
                  <div className="pointer-events-none absolute inset-x-3 top-1/2 z-[1] h-10 -translate-y-1/2 rounded-lg bg-primary/10 ring-1 ring-primary/15" />
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
              'flex h-10 w-full snap-center items-center justify-center text-base tabular-nums',
              controlTransition,
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
