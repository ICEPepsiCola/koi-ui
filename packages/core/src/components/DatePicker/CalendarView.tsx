import { useEffect, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import type { FieldSize } from '../../utils/interaction';
import { CalendarMonthPanel } from '../shared/CalendarMonthPanel';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { formatDate, parseDate } from './dateUtils';

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

  useEffect(() => {
    if (!open || !value) return;
    const next = parseDate(value);
    if (!next) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
  }, [open, value]);

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange?.(formatDate(date));
    setOpen(false);
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
      <FloatMenu
        open={open}
        className="max-w-xs rounded-box border-border/70 p-3 shadow-sm"
      >
        <CalendarMonthPanel
          viewYear={viewYear}
          viewMonth={viewMonth}
          onViewChange={(year, month) => {
            setViewYear(year);
            setViewMonth(month);
          }}
          selected={selected}
          onSelect={selectDate}
          isDateDisabled={isDateDisabled}
        />
      </FloatMenu>
    </div>
  );
}
