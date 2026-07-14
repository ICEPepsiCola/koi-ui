import { useMemo, useState, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  disabledDate?: (date: Date) => boolean;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
  const [viewDate, setViewDate] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [viewDate]);

  const handleSelect = (date: Date) => {
    if (disabledDate?.(date)) return;
    if (value === undefined) setInternal(date);
    onChange?.(date);
  };

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border border-border bg-surface p-4',
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
          onClick={prevMonth}
        >
          ‹
        </button>
        <span className="text-sm font-medium">
          {viewDate.getFullYear()}年{viewDate.getMonth() + 1}月
        </span>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm hover:bg-muted"
          onClick={nextMonth}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) =>
          date ? (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabledDate?.(date)}
              className={cn(
                'h-8 rounded-md text-sm transition-colors',
                isSameDay(date, selected)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
                disabledDate?.(date) && 'cursor-not-allowed opacity-40',
              )}
              onClick={() => handleSelect(date)}
            >
              {date.getDate()}
            </button>
          ) : (
            <div key={`empty-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
