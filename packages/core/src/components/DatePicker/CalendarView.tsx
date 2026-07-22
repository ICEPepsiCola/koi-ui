import { useEffect, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
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
  size?: FieldSize;
}

export function CalendarView({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  min,
  max,
  clearable = false,
  size = 'md',
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
  const hasValue = Boolean(value);

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
      <FieldTrigger
        size={size}
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
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
      />
      <FloatMenu open={open} className="max-w-72 p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className={cn(
              'rounded-selector px-2 py-1 text-sm hover:bg-muted',
              controlTransition,
              focusRing,
              pressable,
            )}
            onClick={() => shiftMonth(-1)}
          >
            ‹
          </button>
          <span className="text-sm font-medium">
            {viewYear} 年 {viewMonth} 月
          </span>
          <button
            type="button"
            className={cn(
              'rounded-selector px-2 py-1 text-sm hover:bg-muted',
              controlTransition,
              focusRing,
              pressable,
            )}
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
                  'h-9 rounded-selector text-sm hover:bg-muted',
                  controlTransition,
                  focusRing,
                  isSelected &&
                    'bg-primary/10 font-medium text-primary ring-1 ring-primary/15 hover:bg-primary/10',
                  isToday && !isSelected && 'border border-primary/40',
                  dayDisabled && 'cursor-not-allowed opacity-40',
                )}
                onClick={() => selectDay(day)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </FloatMenu>
    </div>
  );
}
