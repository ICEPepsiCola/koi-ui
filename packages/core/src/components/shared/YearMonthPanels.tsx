import { ChevronLeftIcon, ChevronRightIcon } from '@koi-ui/icons';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  focusRing,
  pressable,
} from '../../utils/interaction';

const MONTH_LABELS_ZH = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

const MONTH_LABELS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function NavButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
        controlTransition,
        focusRing,
        pressable,
      )}
      onClick={onClick}
    >
      {label.includes('Previous') || label.includes('上') ? (
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
      ) : (
        <ChevronRightIcon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

export interface YearPanelProps {
  /** Decade start, e.g. 2020 for 2020–2029 */
  decadeStart: number;
  onDecadeChange: (decadeStart: number) => void;
  selectedYear?: number | null;
  onSelect: (year: number) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export function YearPanel({
  decadeStart,
  onDecadeChange,
  selectedYear,
  onSelect,
  minYear,
  maxYear,
  className,
}: YearPanelProps) {
  const { locale } = useKoiContext();
  const years = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);
  const label =
    locale === 'en-US'
      ? `${decadeStart} – ${decadeStart + 9}`
      : `${decadeStart}年 – ${decadeStart + 9}年`;

  return (
    <div className={cn('w-[268px]', className)}>
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <NavButton
          label={locale === 'en-US' ? 'Previous decade' : '上十年'}
          onClick={() => onDecadeChange(decadeStart - 10)}
        />
        <span className="text-sm font-semibold tracking-tight tabular-nums">
          {label}
        </span>
        <NavButton
          label={locale === 'en-US' ? 'Next decade' : '下十年'}
          onClick={() => onDecadeChange(decadeStart + 10)}
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {years.map((year) => {
          const outOfDecade = year < decadeStart || year > decadeStart + 9;
          const disabled =
            (minYear !== undefined && year < minYear) ||
            (maxYear !== undefined && year > maxYear);
          const selected = selectedYear === year;
          return (
            <button
              key={year}
              type="button"
              disabled={disabled}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-[13px] tabular-nums',
                controlTransition,
                focusRing,
                selected &&
                  'bg-primary font-semibold text-primary-foreground shadow-sm',
                !selected && !disabled && 'hover:bg-muted',
                outOfDecade && !selected && 'text-muted-foreground/45',
                !disabled && pressable,
                disabled && 'cursor-not-allowed opacity-35',
              )}
              onClick={() => onSelect(year)}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface MonthPanelProps {
  year: number;
  onYearChange: (year: number) => void;
  selectedMonth?: number | null;
  /** 1–12 */
  onSelect: (year: number, month: number) => void;
  minMonth?: string;
  maxMonth?: string;
  className?: string;
}

export function MonthPanel({
  year,
  onYearChange,
  selectedMonth,
  onSelect,
  minMonth,
  maxMonth,
  className,
}: MonthPanelProps) {
  const { locale } = useKoiContext();
  const labels = locale === 'en-US' ? MONTH_LABELS_EN : MONTH_LABELS_ZH;

  return (
    <div className={cn('w-[268px]', className)}>
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <NavButton
          label={locale === 'en-US' ? 'Previous year' : '上一年'}
          onClick={() => onYearChange(year - 1)}
        />
        <span className="text-sm font-semibold tracking-tight tabular-nums">
          {locale === 'en-US' ? year : `${year}年`}
        </span>
        <NavButton
          label={locale === 'en-US' ? 'Next year' : '下一年'}
          onClick={() => onYearChange(year + 1)}
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {labels.map((monthLabel, index) => {
          const month = index + 1;
          const value = `${year}-${String(month).padStart(2, '0')}`;
          const disabled =
            (minMonth !== undefined && value < minMonth) ||
            (maxMonth !== undefined && value > maxMonth);
          const selected = selectedMonth === month;
          return (
            <button
              key={monthLabel}
              type="button"
              disabled={disabled}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-[13px]',
                controlTransition,
                focusRing,
                selected &&
                  'bg-primary font-semibold text-primary-foreground shadow-sm',
                !selected && !disabled && 'hover:bg-muted',
                !disabled && pressable,
                disabled && 'cursor-not-allowed opacity-35',
              )}
              onClick={() => onSelect(year, month)}
            >
              {monthLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
