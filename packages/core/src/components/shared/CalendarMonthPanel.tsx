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
  isSameDay,
} from '../DatePicker/dateUtils';

export interface CalendarMonthPanelProps {
  viewYear: number;
  /** 1–12 */
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  selected?: Date | null;
  onSelect: (date: Date) => void;
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
}

export function CalendarMonthPanel({
  viewYear,
  viewMonth,
  onViewChange,
  selected,
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
          const isToday = isSameDay(date, today);

          return (
            <button
              key={`${viewYear}-${viewMonth}-${day}`}
              type="button"
              disabled={disabled}
              aria-label={date.toLocaleDateString(
                locale === 'en-US' ? 'en-US' : 'zh-CN',
              )}
              aria-pressed={isSelected}
              className={cn(
                'h-9 rounded-selector text-sm tabular-nums',
                controlTransition,
                focusRing,
                isSelected &&
                  'bg-primary/10 font-medium text-primary ring-1 ring-primary/15 hover:bg-primary/10',
                !isSelected && !disabled && 'hover:bg-muted',
                isToday && !isSelected && 'border border-primary/40',
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
