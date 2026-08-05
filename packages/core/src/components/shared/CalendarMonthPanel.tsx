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
    <div className={cn('koi-calendar-panel', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={prevLabel}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-selector text-muted-foreground hover:bg-muted hover:text-foreground',
            controlTransition,
            focusRing,
            pressable,
          )}
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        </button>
        <span className="text-sm font-medium tabular-nums">
          {formatMonthLabel(viewYear, viewMonth, locale)}
        </span>
        <button
          type="button"
          aria-label={nextLabel}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-selector text-muted-foreground hover:bg-muted hover:text-foreground',
            controlTransition,
            focusRing,
            pressable,
          )}
          onClick={() => shiftMonth(1)}
        >
          <ChevronRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekdays.map((label) => (
          <span key={label} className="py-1 font-medium">
            {label}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {weeks.flat().map((day, idx) => {
          if (!day) {
            return <span key={`empty-${idx}`} className="h-9" aria-hidden />;
          }

          const date = new Date(viewYear, viewMonth - 1, day);
          const disabled = isDateDisabled?.(date) ?? false;
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isRangeEdge =
            (rangeStart ? isSameDay(date, rangeStart) : false) ||
            (rangeEnd ? isSameDay(date, rangeEnd) : false);
          const inRange = isInRange(date, rangeStart, rangeEnd);
          const inWeek =
            mode === 'week' && weekSelected
              ? weeksEqual(date, weekSelected)
              : false;
          const isToday = isSameDay(date, today);

          return (
            <button
              key={`${viewYear}-${viewMonth}-${day}`}
              type="button"
              disabled={disabled}
              aria-label={date.toLocaleDateString(
                locale === 'en-US' ? 'en-US' : 'zh-CN',
              )}
              aria-pressed={isSelected || isRangeEdge || inWeek}
              className={cn(
                'h-9 rounded-selector text-sm tabular-nums',
                controlTransition,
                focusRing,
                (isSelected || isRangeEdge || inWeek) &&
                  'bg-primary/10 font-medium text-primary ring-1 ring-primary/15 hover:bg-primary/10',
                inRange &&
                  !isRangeEdge &&
                  'rounded-none bg-primary/6 text-primary',
                !isSelected &&
                  !isRangeEdge &&
                  !inRange &&
                  !inWeek &&
                  !disabled &&
                  'hover:bg-muted',
                isToday &&
                  !isSelected &&
                  !isRangeEdge &&
                  !inWeek &&
                  'border border-primary/40',
                !disabled && pressable,
                disabled && 'cursor-not-allowed opacity-40',
              )}
              onClick={() => {
                if (!disabled) onSelect(date);
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
