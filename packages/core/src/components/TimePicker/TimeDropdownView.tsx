import { useEffect, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { PickerWheels } from '../shared/PickerWheels';
import { pad2 } from '../DatePicker/dateUtils';

export interface TimeDropdownViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
  clearable?: boolean;
  size?: FieldSize;
}

function parseTime(value?: string) {
  const parts = (value ?? '').split(':').map(Number);
  return {
    hour: Number.isFinite(parts[0]) ? parts[0]! : 0,
    minute: Number.isFinite(parts[1]) ? parts[1]! : 0,
    second: Number.isFinite(parts[2]) ? parts[2]! : 0,
  };
}

function formatTime(
  hour: number,
  minute: number,
  second: number,
  withSeconds: boolean,
) {
  return withSeconds
    ? `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`
    : `${pad2(hour)}:${pad2(minute)}`;
}

/**
 * Desktop TimePicker panel — shared drum wheels with Picker.
 */
export function TimeDropdownView({
  value,
  onChange,
  placeholder = '选择时间',
  disabled = false,
  format = 'HH:mm',
  clearable = false,
  size = 'md',
}: TimeDropdownViewProps) {
  const { messages } = useKoiContext();
  const withSeconds = format === 'HH:mm:ss';
  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const hasValue = Boolean(value);

  useEffect(() => {
    if (!open) return;
    const next = parseTime(value);
    setHour(next.hour);
    setMinute(next.minute);
    setSecond(next.second);
  }, [open, value]);

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

  const confirm = (h = hour, m = minute, s = second) => {
    onChange?.(formatTime(h, m, s, withSeconds));
    setOpen(false);
  };

  const pickNow = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    setHour(h);
    setMinute(m);
    setSecond(s);
    confirm(h, m, s);
  };

  const wheelColumns = [
    {
      key: 'hour',
      options: hours.map((v) => ({ value: v, label: v })),
      value: pad2(hour),
      onChange: (v: string) => setHour(Number(v)),
    },
    {
      key: 'minute',
      options: minutes.map((v) => ({ value: v, label: v })),
      value: pad2(minute),
      onChange: (v: string) => setMinute(Number(v)),
    },
    ...(withSeconds
      ? [
          {
            key: 'second',
            options: minutes.map((v) => ({ value: v, label: v })),
            value: pad2(second),
            onChange: (v: string) => setSecond(Number(v)),
          },
        ]
      : []),
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        'koi-timepicker-demo relative w-full',
        withSeconds ? 'max-w-[240px]' : 'max-w-[200px]',
      )}
    >
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={
          <span className="tabular-nums">{value}</span>
        }
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        trailing={<ClockIcon className={cn(open && 'text-primary')} />}
        onClear={() => {
          onChange?.('');
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
      <FloatMenu open={open} className="overflow-hidden p-0">
        <div className="px-1 pt-1">
          <PickerWheels
            density="compact"
            maxVisibleRows={5}
            columns={wheelColumns}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border/70 px-2 py-2">
          <button
            type="button"
            className={cn(
              'h-8 rounded-field px-2.5 text-sm text-primary',
              controlTransition,
              pressable,
              'hover:bg-primary/5',
            )}
            onClick={pickNow}
          >
            此刻
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
            onClick={() => confirm()}
          >
            确定
          </button>
        </div>
      </FloatMenu>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('h-4 w-4 shrink-0 text-muted-foreground', className)}
    >
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l2.75 2.75" />
    </svg>
  );
}
