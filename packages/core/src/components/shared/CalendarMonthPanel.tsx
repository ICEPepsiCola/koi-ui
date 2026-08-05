import { ChevronLeftIcon, ChevronRightIcon } from '@koi-ui/icons';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  focusRing,
  pressable,
} from '../../utils/interaction';
import {
  formatMonthLabel,
  getMonthMatrix,
  getWeekdays,
  isInRange,
  isSameDay,
  weeksEqual,
} from '../DatePicker/dateUtils';

export interface CalendarMonthPanelProps {
  viewYear: number;
  /** 1–12 */
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  selected?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  /** Highlight ISO week containing this date. */
  weekSelected?: Date | null;
  mode?: 'date' | 'week';
  onSelect: (date: Date) => void;
  isDateDisabled?: (date: Date) => boolean;
  /** @default true */
  showPrev?: boolean;
  /** @default true */
  showNext?: boolean;
  className?: string;
}

export function CalendarMonthPanel({
  viewYear,
  viewMonth,
  onViewChange,
  selected,
  rangeStart,
  rangeEnd,
  weekSelected,
  mode = 'date',
  onSelect,
  isDateDisabled,
  showPrev = true,
  showNext = true,
  className,
}: CalendarMonthPanelProps) {
  const { locale } = useKoiContext();
  const today = new Date();
  const weeks = getMonthMatrix(viewYear, viewMonth);
  const weekdays = getWeekdays(locale);
  const prevLabel = locale === 'en-US' ? 'Previous month' : '上个月';
  const nextLabel = locale === 'en-US' ? 'Next month' : '下个月';

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth - 1 + delta, 1);
    onViewChange(next.getFullYear(), next.getMonth() + 1);
  };

  return (
    <div className={cn('koi-calendar-panel w-[268px]', className)}>
      <div className="mb-1.5 flex items-center justify-between gap-1">
        {showPrev ? (
          <button
            type="button"
            aria-label={prevLabel}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
              controlTransition,
              focusRing,
              pressable,
            )}
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <span className="inline-flex h-8 w-8" aria-hidden />
        )}
        <span className="text-sm font-semibold tracking-tight text-surface-foreground tabular-nums">
          {formatMonthLabel(viewYear, viewMonth, locale)}
        </span>
        {showNext ? (
          <button
            type="button"
            aria-label={nextLabel}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
              controlTransition,
              focusRing,
              pressable,
            )}
            onClick={() => shiftMonth(1)}
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <span className="inline-flex h-8 w-8" aria-hidden />
        )}
      </div>
      <div className="mb-0.5 grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
        {weekdays.map((label) => (
          <span key={label} className="flex h-7 items-center justify-center">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((cell) => {
          const date = new Date(cell.year, cell.month - 1, cell.day);
          const disabled = isDateDisabled?.(date) ?? false;
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isStart = rangeStart ? isSameDay(date, rangeStart) : false;
          const isEnd = rangeEnd ? isSameDay(date, rangeEnd) : false;
          const isRangeEdge = isStart || isEnd;
          const inRange = isInRange(date, rangeStart, rangeEnd);
          const inWeek =
            mode === 'week' && weekSelected
              ? weeksEqual(date, weekSelected)
              : false;
          const isToday = isSameDay(date, today);
          const solid = isSelected || isRangeEdge || inWeek;

          return (
            <button
              key={`${cell.year}-${cell.month}-${cell.day}`}
              type="button"
              disabled={disabled}
              aria-label={date.toLocaleDateString(
                locale === 'en-US' ? 'en-US' : 'zh-CN',
              )}
              aria-pressed={solid}
              className={cn(
                'relative flex h-9 items-center justify-center text-[13px] tabular-nums',
                controlTransition,
                focusRing,
                !disabled && pressable,
                disabled && 'cursor-not-allowed opacity-35',
                cell.outside && !solid && !inRange && 'text-muted-foreground/45',
                !cell.outside &&
                  !solid &&
                  !inRange &&
                  !disabled &&
                  'text-surface-foreground',
              )}
              onClick={() => {
                if (disabled) return;
                if (cell.outside) {
                  onViewChange(cell.year, cell.month);
                }
                onSelect(date);
              }}
            >
              {inRange && !isRangeEdge ? (
                <span
                  className="absolute inset-y-[5px] inset-x-0 bg-primary/12"
                  aria-hidden
                />
              ) : null}
              {inRange && isStart && rangeEnd ? (
                <span
                  className="absolute inset-y-[5px] left-1/2 right-0 bg-primary/12"
                  aria-hidden
                />
              ) : null}
              {inRange && isEnd && rangeStart ? (
                <span
                  className="absolute inset-y-[5px] left-0 right-1/2 bg-primary/12"
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  'relative z-1 flex size-8 items-center justify-center rounded-full',
                  solid &&
                    'bg-primary font-semibold text-primary-foreground shadow-sm',
                  !solid && inRange && 'font-medium text-primary',
                  !solid &&
                    !inRange &&
                    !disabled &&
                    'hover:bg-muted',
                  isToday &&
                    !solid &&
                    'font-semibold text-primary ring-1 ring-inset ring-primary/40',
                )}
              >
                {cell.day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
