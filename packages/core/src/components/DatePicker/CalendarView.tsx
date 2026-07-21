import { useEffect, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { ClearButton } from '../shared/ClearButton';
import {
  formatDate,
  getMonthMatrix,
  parseDate,
  WEEKDAYS,
} from './dateUtils';

export interface CalendarViewProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  clearable?: boolean;
}

export function CalendarView({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  min,
  max,
  clearable = false,
}: CalendarViewProps) {
  const { messages } = useKoiContext();
  const selected = parseDate(value);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    (selected?.getMonth() ?? today.getMonth()) + 1,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const weeks = getMonthMatrix(viewYear, viewMonth);
  const showClear = clearable && !disabled && Boolean(value);

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

  const isDisabledDate = (day: number) => {
    const date = formatDate(new Date(viewYear, viewMonth - 1, day));
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  const selectDay = (day: number) => {
    if (isDisabledDate(day)) return;
    onChange?.(formatDate(new Date(viewYear, viewMonth - 1, day)));
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
  };

  return (
    <div ref={containerRef} className="koi-datepicker-demo relative w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
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
        <div className="absolute left-0 top-full z-50 mt-1 w-full max-w-72 rounded-lg border border-border bg-surface p-3 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm hover:bg-muted"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>
            <span className="text-sm font-medium">
              {viewYear} 年 {viewMonth} 月
            </span>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm hover:bg-muted"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {weeks.flat().map((day, idx) => {
              if (!day) return <span key={`empty-${idx}`} />;
              const dateStr = formatDate(
                new Date(viewYear, viewMonth - 1, day),
              );
              const isSelected = value === dateStr;
              const isToday = formatDate(today) === dateStr;
              const dayDisabled = isDisabledDate(day);
              return (
                <button
                  key={`${viewYear}-${viewMonth}-${day}`}
                  type="button"
                  disabled={dayDisabled}
                  className={cn(
                    'h-9 rounded-md text-sm transition-colors hover:bg-muted',
                    isSelected &&
                      'bg-primary text-primary-foreground hover:bg-primary hover:opacity-90',
                    isToday && !isSelected && 'border border-primary',
                    dayDisabled && 'cursor-not-allowed opacity-40',
                  )}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
