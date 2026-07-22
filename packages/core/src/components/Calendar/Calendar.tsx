import { useEffect, useState, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { boxSurface } from '../../utils/interaction';
import { CalendarMonthPanel } from '../shared/CalendarMonthPanel';

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  disabledDate?: (date: Date) => boolean;
}

export function Calendar({
  className,
  value,
  defaultValue,
  onChange,
  disabledDate,
  ...props
}: CalendarProps) {
  const [internal, setInternal] = useState(defaultValue ?? new Date());
  const selected = value ?? internal;
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth() + 1);

  useEffect(() => {
    if (!value) return;
    setViewYear(value.getFullYear());
    setViewMonth(value.getMonth() + 1);
  }, [value]);

  const handleSelect = (date: Date) => {
    if (disabledDate?.(date)) return;
    if (value === undefined) setInternal(date);
    onChange?.(date);
  };

  return (
    <div
      className={cn('w-full max-w-xs', boxSurface, 'p-3', className)}
      {...props}
    >
      <CalendarMonthPanel
        viewYear={viewYear}
        viewMonth={viewMonth}
        onViewChange={(year, month) => {
          setViewYear(year);
          setViewMonth(month);
        }}
        selected={selected}
        onSelect={handleSelect}
        isDateDisabled={disabledDate}
      />
    </div>
  );
}
