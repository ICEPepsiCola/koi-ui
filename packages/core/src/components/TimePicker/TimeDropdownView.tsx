import { useEffect, useRef, useState } from 'react';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  focusRing,
  pressable,
} from '../../utils/interaction';
import type { FieldSize } from '../../utils/interaction';
import { pad2 } from '../DatePicker/dateUtils';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { MenuColumns } from '../shared/MenuColumns';
import type { TimePickerValue } from './TimePicker';
import {
  asSingleTime,
  displayTimeValue,
  emptyTimeValue,
  formatTime,
  parseTime,
} from './timeUtils';

export interface TimeDropdownViewProps {
  value?: TimePickerValue;
  onChange?: (value: TimePickerValue) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
  clearable?: boolean;
  size?: FieldSize;
  range?: boolean;
}

/**
 * Desktop TimePicker — daisyUI-style dropdown + menu columns.
 */
export function TimeDropdownView({
  value,
  onChange,
  placeholder = '选择时间',
  disabled = false,
  format = 'HH:mm',
  clearable = false,
  size = 'md',
  range = false,
}: TimeDropdownViewProps) {
  const { messages, locale } = useKoiContext();
  const withSeconds = format === 'HH:mm:ss';
  const seed = asSingleTime(value);
  const parsed = parseTime(seed);
  const [open, setOpen] = useState(false);
  const [rangeStep, setRangeStep] = useState<'start' | 'end'>('start');
  const [rangeStart, setRangeStart] = useState('');
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const display = displayTimeValue(value, range);
  const hasValue = Boolean(display);

  useEffect(() => {
    if (!open) return;
    const source =
      range && rangeStep === 'end' && rangeStart
        ? rangeStart
        : asSingleTime(value);
    const next = parseTime(source);
    setHour(next.hour);
    setMinute(next.minute);
    setSecond(next.second);
  }, [open, value, range, rangeStep, rangeStart]);

  useEffect(() => {
    if (!open) {
      setRangeStep('start');
      setRangeStart('');
    }
  }, [open]);

  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    containerRef,
    closeOnPointerDownOutside: true,
  });

  const confirm = (h = hour, m = minute, s = second) => {
    const next = formatTime(h, m, s, withSeconds);
    if (range) {
      if (rangeStep === 'start') {
        setRangeStart(next);
        setRangeStep('end');
        return;
      }
      const ordered = rangeStart <= next ? [rangeStart, next] : [next, rangeStart];
      onChange?.(ordered as [string, string]);
      setOpen(false);
      return;
    }
    onChange?.(next);
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

  const columns = [
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
        withSeconds ? 'max-w-63' : 'max-w-49',
      )}
    >
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={<span className="tabular-nums">{display}</span>}
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        trailing={<ClockIcon className={cn(open && 'text-primary')} />}
        onClear={() => {
          onChange?.(emptyTimeValue(range));
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
        className="overflow-hidden rounded-box border-border/70 p-0 shadow-sm"
      >
        {range ? (
          <div className="border-b border-border/70 px-3 py-2 text-xs text-muted-foreground">
            {rangeStep === 'start'
              ? locale === 'en-US'
                ? 'Start time'
                : '开始时间'
              : locale === 'en-US'
                ? 'End time'
                : '结束时间'}
          </div>
        ) : null}
        <MenuColumns columns={columns} />
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
            {locale === 'en-US' ? 'Now' : '此刻'}
          </button>
          <button
            type="button"
            className={cn(
              'h-8 rounded-field bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-field',
              controlTransition,
              focusRing,
              pressable,
              'hover:brightness-[1.04] active:brightness-[0.96]',
            )}
            onClick={() => confirm()}
          >
            {range && rangeStep === 'start'
              ? locale === 'en-US'
                ? 'Next'
                : '下一步'
              : locale === 'en-US'
                ? 'OK'
                : '确定'}
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
