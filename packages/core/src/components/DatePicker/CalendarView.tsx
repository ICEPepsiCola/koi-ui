import { useEffect, useRef, useState } from 'react';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  focusRing,
  pressable,
} from '../../utils/interaction';
import { CalendarMonthPanel } from '../shared/CalendarMonthPanel';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { MenuColumns } from '../shared/MenuColumns';
import { MonthPanel, YearPanel } from '../shared/YearMonthPanels';
import {
  emptyDateValue,
  formatDate,
  formatDateTime,
  formatMonth,
  formatWeek,
  formatYear,
  pad2,
  parseDate,
  parseDateTime,
  parseMonth,
  parseWeek,
  parseYear,
  resolveTriggerPlaceholder,
  shiftYearMonth,
} from './dateUtils';
import {
  resolveTimeFormat,
  type DatePickerProps,
  type DatePickerValue,
} from './types';

export type CalendarViewProps = Omit<DatePickerProps, 'responsive'>;

function parseTimeParts(value?: string) {
  const time = value?.trim().split(/\s+/)[1] ?? '00:00:00';
  const [h = 0, m = 0, s = 0] = time.split(':').map(Number);
  return { hour: h || 0, minute: m || 0, second: s || 0 };
}

function asSingle(value?: DatePickerValue) {
  return typeof value === 'string' ? value : value?.[0];
}

function asRange(value?: DatePickerValue): [string, string] {
  if (Array.isArray(value)) return [value[0] ?? '', value[1] ?? ''];
  return ['', ''];
}

export function CalendarView({
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  disabledDate,
  clearable = false,
  size = 'md',
  picker = 'date',
  range = false,
  showTime = false,
}: CalendarViewProps) {
  const { messages, locale } = useKoiContext();
  const timeFormat = picker === 'date' ? resolveTimeFormat(showTime) : null;
  const withSeconds = timeFormat === 'HH:mm:ss';
  const single = asSingle(value);
  const [rangeStartStr, rangeEndStr] = asRange(value);
  const dualMonth = range && (picker === 'date' || picker === 'week');

  const selectedDate =
    picker === 'date'
      ? timeFormat
        ? parseDateTime(single)
        : parseDate(single)
      : picker === 'week'
        ? parseWeek(single)
        : picker === 'month'
          ? parseMonth(single)
          : parseYear(single);

  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    (selectedDate?.getMonth() ?? today.getMonth()) + 1,
  );
  const [decadeStart, setDecadeStart] = useState(
    Math.floor((selectedDate?.getFullYear() ?? today.getFullYear()) / 10) * 10,
  );
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    containerRef,
    closeOnPointerDownOutside: true,
  });

  useEffect(() => {
    if (!open) return;
    const next =
      picker === 'date'
        ? timeFormat
          ? parseDateTime(range ? rangeStartStr || single : single)
          : parseDate(range ? rangeStartStr || single : single)
        : picker === 'week'
          ? parseWeek(single)
          : picker === 'month'
            ? parseMonth(single)
            : parseYear(single);
    if (next) {
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth() + 1);
      setDecadeStart(Math.floor(next.getFullYear() / 10) * 10);
    }
    if (timeFormat) {
      const parts = parseTimeParts(range ? rangeStartStr : single);
      setHour(parts.hour);
      setMinute(parts.minute);
      setSecond(parts.second);
    }
    setDraftStart(null);
    setDraftDate(null);
  }, [open, value, picker, timeFormat, range, rangeStartStr, single]);

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    if (min && dateStr < min.slice(0, 10)) return true;
    if (max && dateStr > max.slice(0, 10)) return true;
    return disabledDate?.(date) ?? false;
  };

  const emit = (next: DatePickerValue) => {
    onChange?.(next);
    setOpen(false);
    setDraftStart(null);
  };

  const formatWithTime = (date: Date) => {
    if (!timeFormat) return formatDate(date);
    const d = new Date(date);
    d.setHours(hour, minute, second, 0);
    return formatDateTime(d, timeFormat);
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (picker === 'week') {
      emit(formatWeek(date));
      return;
    }

    if (range) {
      if (!draftStart) {
        setDraftStart(date);
        return;
      }
      const start = draftStart <= date ? draftStart : date;
      const end = draftStart <= date ? date : draftStart;
      emit([formatWithTime(start), formatWithTime(end)]);
      return;
    }

    if (timeFormat) {
      setDraftDate(date);
      return;
    }

    emit(formatDate(date));
  };

  const confirmTime = () => {
    if (range) {
      if (!draftStart && !(rangeStartStr && rangeEndStr)) return;
      if (draftStart) return;
      const startDate = parseDateTime(rangeStartStr) ?? parseDate(rangeStartStr);
      const endDate = parseDateTime(rangeEndStr) ?? parseDate(rangeEndStr);
      if (!startDate || !endDate) return;
      startDate.setHours(hour, minute, second, 0);
      endDate.setHours(hour, minute, second, 0);
      emit([
        formatDateTime(startDate, timeFormat ?? 'HH:mm'),
        formatDateTime(endDate, timeFormat ?? 'HH:mm'),
      ]);
      return;
    }
    const base = draftDate ?? selectedDate;
    if (!base) return;
    emit(formatWithTime(base));
  };

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const rangeStartDate = draftStart ?? parseDate(rangeStartStr.split(' ')[0]);
  const rangeEndDate = draftStart
    ? null
    : parseDate(rangeEndStr.split(' ')[0]);
  const rightMonth = shiftYearMonth(viewYear, viewMonth, 1);
  const trigger = resolveTriggerPlaceholder(
    placeholder,
    range,
    locale,
    value,
    draftStart,
  );

  const monthPanelProps = {
    selected:
      picker === 'date' && !range ? (draftDate ?? selectedDate ?? null) : null,
    rangeStart: range ? rangeStartDate : null,
    rangeEnd: range ? rangeEndDate : null,
    weekSelected: picker === 'week' ? (selectedDate ?? null) : null,
    mode: (picker === 'week' ? 'week' : 'date') as 'date' | 'week',
    onSelect: selectDate,
    isDateDisabled,
  };

  return (
    <div ref={containerRef} className="koi-datepicker-demo relative w-full">
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={trigger.hasValue}
        display={trigger.display}
        placeholder={trigger.placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.(emptyDateValue(range));
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
        className={cn(
          'rounded-box border-border/70 p-3 shadow-sm',
          dualMonth
            ? 'w-max max-w-[calc(100vw-2rem)]'
            : timeFormat
              ? 'w-[22rem] max-w-[calc(100vw-2rem)]'
              : 'max-w-xs',
        )}
      >
        {picker === 'year' ? (
          <YearPanel
            decadeStart={decadeStart}
            onDecadeChange={setDecadeStart}
            selectedYear={selectedDate?.getFullYear() ?? null}
            minYear={min ? Number(min.slice(0, 4)) : undefined}
            maxYear={max ? Number(max.slice(0, 4)) : undefined}
            onSelect={(year) => {
              const date = new Date(year, 0, 1);
              if (isDateDisabled(date)) return;
              emit(formatYear(date));
            }}
          />
        ) : null}

        {picker === 'month' ? (
          <MonthPanel
            year={viewYear}
            onYearChange={setViewYear}
            selectedMonth={
              selectedDate && selectedDate.getFullYear() === viewYear
                ? selectedDate.getMonth() + 1
                : null
            }
            minMonth={min?.slice(0, 7)}
            maxMonth={max?.slice(0, 7)}
            onSelect={(year, month) => {
              const date = new Date(year, month - 1, 1);
              if (isDateDisabled(date)) return;
              emit(formatMonth(date));
            }}
          />
        ) : null}

        {picker === 'date' || picker === 'week' ? (
          <div className={cn(timeFormat && 'flex flex-col gap-3 sm:flex-row')}>
            {dualMonth ? (
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <CalendarMonthPanel
                  viewYear={viewYear}
                  viewMonth={viewMonth}
                  showNext={false}
                  onViewChange={(year, month) => {
                    setViewYear(year);
                    setViewMonth(month);
                  }}
                  {...monthPanelProps}
                />
                <div className="hidden w-px bg-border/70 md:block" />
                <CalendarMonthPanel
                  viewYear={rightMonth.year}
                  viewMonth={rightMonth.month}
                  showPrev={false}
                  onViewChange={(year, month) => {
                    const left = shiftYearMonth(year, month, -1);
                    setViewYear(left.year);
                    setViewMonth(left.month);
                  }}
                  {...monthPanelProps}
                />
              </div>
            ) : (
              <CalendarMonthPanel
                viewYear={viewYear}
                viewMonth={viewMonth}
                onViewChange={(year, month) => {
                  setViewYear(year);
                  setViewMonth(month);
                }}
                {...monthPanelProps}
              />
            )}
            {timeFormat ? (
              <div className="flex min-w-28 flex-col gap-2 border-t border-border/70 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                <MenuColumns
                  columns={[
                    {
                      key: 'h',
                      options: hours.map((h) => ({ value: h, label: h })),
                      value: pad2(hour),
                      onChange: (v) => setHour(Number(v)),
                    },
                    {
                      key: 'm',
                      options: minutes.map((m) => ({ value: m, label: m })),
                      value: pad2(minute),
                      onChange: (v) => setMinute(Number(v)),
                    },
                    ...(withSeconds
                      ? [
                          {
                            key: 's',
                            options: minutes.map((s) => ({
                              value: s,
                              label: s,
                            })),
                            value: pad2(second),
                            onChange: (v: string) => setSecond(Number(v)),
                          },
                        ]
                      : []),
                  ]}
                />
                <button
                  type="button"
                  className={cn(
                    'h-8 rounded-selector bg-primary text-sm text-primary-foreground',
                    controlTransition,
                    focusRing,
                    pressable,
                  )}
                  onClick={confirmTime}
                >
                  {locale === 'en-US' ? 'OK' : '确定'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {range && draftStart ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {locale === 'en-US'
              ? 'Select end date'
              : '请选择结束日期'}
          </p>
        ) : null}
      </FloatMenu>
    </div>
  );
}
