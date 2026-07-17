import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { pad2 } from '../DatePicker/dateUtils';

export interface TimeDropdownViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
}

const CELL_H = 28;
const COL_H = 224;

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
 * Desktop TimePicker panel — width matches trigger, columns share space evenly.
 */
export function TimeDropdownView({
  value,
  onChange,
  placeholder = '选择时间',
  disabled = false,
  format = 'HH:mm',
}: TimeDropdownViewProps) {
  const withSeconds = format === 'HH:mm:ss';
  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);
  const containerRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));

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

  return (
    <div
      ref={containerRef}
      className={cn(
        'koi-timepicker-demo relative w-full',
        withSeconds ? 'max-w-[240px]' : 'max-w-[200px]',
      )}
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-sm',
          'transition-colors hover:border-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          open && 'border-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-left tabular-nums leading-none',
            value ? 'text-surface-foreground' : 'text-muted-foreground',
          )}
        >
          {value ?? placeholder}
        </span>
        <ClockIcon className={cn(open && 'text-primary')} />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-surface',
            'shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]',
          )}
        >
          <div className="flex">
            <TimeColumn
              options={hours}
              value={pad2(hour)}
              onChange={(v) => setHour(Number(v))}
            />
            <TimeColumn
              options={minutes}
              value={pad2(minute)}
              onChange={(v) => setMinute(Number(v))}
            />
            {withSeconds ? (
              <TimeColumn
                options={minutes}
                value={pad2(second)}
                onChange={(v) => setSecond(Number(v))}
              />
            ) : null}
          </div>
          <div className="flex items-center justify-between border-t border-border/80 px-3 py-2">
            <button
              type="button"
              className="text-sm text-primary transition-opacity hover:opacity-80"
              onClick={pickNow}
            >
              此刻
            </button>
            <button
              type="button"
              className="h-7 rounded px-3 text-sm text-primary-foreground bg-primary transition-opacity hover:opacity-90"
              onClick={() => confirm()}
            >
              确定
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TimeColumn({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const idx = options.indexOf(value);
    if (idx < 0) return;
    // 滚到选中项即可，不追加尾部空白（antd 为让末项贴顶会垫高一截）
    const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
    root.scrollTop = Math.min(idx * CELL_H, maxScroll);
  }, [value, options]);

  return (
    <div
      ref={scrollerRef}
      className={cn(
        'min-w-0 flex-1 overflow-y-auto border-r border-border/70 last:border-r-0',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
      style={{ height: COL_H }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            className="flex w-full items-center justify-center"
            style={{ height: CELL_H }}
            onClick={() => onChange(opt)}
          >
            <span
              className={cn(
                'flex h-6 w-[calc(100%-12px)] items-center justify-center rounded-sm text-sm tabular-nums transition-colors',
                active
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-surface-foreground hover:bg-muted',
              )}
            >
              {opt}
            </span>
          </button>
        );
      })}
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
