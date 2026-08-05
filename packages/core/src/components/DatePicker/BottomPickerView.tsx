import { useEffect, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { PickerWheels } from '../shared/PickerWheels';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import {
  displayDateValue,
  emptyDateValue,
  formatDate,
  formatDateTime,
  formatMonth,
  formatWeek,
  formatYear,
  getDateOfISOWeek,
  getDaysInMonth,
  getISOWeekCount,
  getISOWeekParts,
  pad2,
  parseDate,
  parseDateTime,
  parseMonth,
  parseWeek,
  parseYear,
} from './dateUtils';
import {
  resolveTimeFormat,
  type DatePickerProps,
  type DatePickerValue,
} from './types';

export type BottomPickerViewProps = Omit<DatePickerProps, 'responsive'>;

function buildYears(min?: string, max?: string) {
  const current = new Date().getFullYear();
  const start = min ? Number(min.slice(0, 4)) : current - 50;
  const end = max ? Number(max.slice(0, 4)) : current + 50;
  const years: number[] = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

function asSingle(value?: DatePickerValue) {
  return typeof value === 'string' ? value : value?.[0];
}

function asRange(value?: DatePickerValue): [string, string] {
  if (Array.isArray(value)) return [value[0] ?? '', value[1] ?? ''];
  return ['', ''];
}

function parseTimeParts(value?: string) {
  const time = value?.trim().split(/\s+/)[1] ?? '00:00:00';
  const [h = 0, m = 0, s = 0] = time.split(':').map(Number);
  return { hour: h || 0, minute: m || 0, second: s || 0 };
}

/**
 * Mobile DatePicker — classic iOS wheel sheet.
 */
export function BottomPickerView({
  value,
  onChange,
  placeholder = '选择日期',
  disabled = false,
  min,
  max,
  clearable = false,
  size = 'md',
  picker = 'date',
  range = false,
  showTime = false,
}: BottomPickerViewProps) {
  const { messages, locale } = useKoiContext();
  const timeFormat = picker === 'date' ? resolveTimeFormat(showTime) : null;
  const withSeconds = timeFormat === 'HH:mm:ss';
  const [open, setOpen] = useState(false);
  const [rangeStep, setRangeStep] = useState<'start' | 'end'>('start');
  const [rangeDraft, setRangeDraft] = useState<[string, string]>(['', '']);

  const seed = asSingle(value);
  const seedDate =
    picker === 'date'
      ? (timeFormat ? parseDateTime(seed) : parseDate(seed)) ?? new Date()
      : picker === 'week'
        ? parseWeek(seed) ?? new Date()
        : picker === 'month'
          ? parseMonth(seed) ?? new Date()
          : parseYear(seed) ?? new Date();

  const [year, setYear] = useState(seedDate.getFullYear());
  const [month, setMonth] = useState(seedDate.getMonth() + 1);
  const [day, setDay] = useState(seedDate.getDate());
  const [week, setWeek] = useState(getISOWeekParts(seedDate).week);
  const timeSeed = parseTimeParts(seed);
  const [hour, setHour] = useState(timeSeed.hour);
  const [minute, setMinute] = useState(timeSeed.minute);
  const [second, setSecond] = useState(timeSeed.second);

  const years = buildYears(min, max);
  const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) =>
    pad2(i + 1),
  );
  const weeks = Array.from({ length: getISOWeekCount(year) }, (_, i) =>
    pad2(i + 1),
  );
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));
  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const display = displayDateValue(value, range);
  const hasValue = Boolean(display);

  useScrollLock(open);

  useEffect(() => {
    if (day > days.length) setDay(days.length);
  }, [day, days.length]);

  useEffect(() => {
    if (!open) return;
    const source =
      range && rangeStep === 'end' && rangeDraft[0]
        ? rangeDraft[0]
        : asSingle(value);
    const next =
      picker === 'date'
        ? (timeFormat ? parseDateTime(source) : parseDate(source)) ?? new Date()
        : picker === 'week'
          ? parseWeek(source) ?? new Date()
          : picker === 'month'
            ? parseMonth(source) ?? new Date()
            : parseYear(source) ?? new Date();
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setDay(next.getDate());
    setWeek(getISOWeekParts(next).week);
    const parts = parseTimeParts(source);
    setHour(parts.hour);
    setMinute(parts.minute);
    setSecond(parts.second);
  }, [open, value, picker, timeFormat, range, rangeStep, rangeDraft]);

  useEffect(() => {
    if (!open) {
      setRangeStep('start');
      setRangeDraft(asRange(value));
    }
  }, [open, value]);

  const buildValue = () => {
    if (picker === 'year') return formatYear(new Date(year, 0, 1));
    if (picker === 'month') return formatMonth(new Date(year, month - 1, 1));
    if (picker === 'week') return formatWeek(getDateOfISOWeek(year, week));
    const date = new Date(year, month - 1, day);
    if (timeFormat) {
      date.setHours(hour, minute, second, 0);
      return formatDateTime(date, timeFormat);
    }
    return formatDate(date);
  };

  const confirm = () => {
    const next = buildValue();
    if (picker === 'date') {
      const dayPart = next.slice(0, 10);
      if (min && dayPart < min.slice(0, 10)) return;
      if (max && dayPart > max.slice(0, 10)) return;
    }
    if (range) {
      if (rangeStep === 'start') {
        setRangeDraft([next, '']);
        setRangeStep('end');
        return;
      }
      const start = rangeDraft[0];
      const ordered = start <= next ? [start, next] : [next, start];
      onChange?.(ordered as [string, string]);
      setOpen(false);
      return;
    }
    onChange?.(next);
    setOpen(false);
  };

  const title =
    range
      ? rangeStep === 'start'
        ? locale === 'en-US'
          ? 'Start'
          : '开始'
        : locale === 'en-US'
          ? 'End'
          : '结束'
      : placeholder;

  const columns = (() => {
    const list = [];
    if (picker === 'year') {
      list.push({
        key: 'year',
        options: years.map((y) => ({ value: String(y), label: String(y) })),
        value: String(year),
        onChange: (v: string) => setYear(Number(v)),
      });
      return list;
    }
    if (picker === 'month') {
      list.push(
        {
          key: 'year',
          options: years.map((y) => ({ value: String(y), label: String(y) })),
          value: String(year),
          onChange: (v: string) => setYear(Number(v)),
        },
        {
          key: 'month',
          options: months.map((m) => ({ value: m, label: m })),
          value: pad2(month),
          onChange: (v: string) => setMonth(Number(v)),
        },
      );
      return list;
    }
    if (picker === 'week') {
      list.push(
        {
          key: 'year',
          options: years.map((y) => ({ value: String(y), label: String(y) })),
          value: String(year),
          onChange: (v: string) => setYear(Number(v)),
        },
        {
          key: 'week',
          options: weeks.map((w) => ({
            value: w,
            label: locale === 'en-US' ? `W${w}` : `${Number(w)}周`,
          })),
          value: pad2(week),
          onChange: (v: string) => setWeek(Number(v)),
        },
      );
      return list;
    }
    list.push(
      {
        key: 'year',
        options: years.map((y) => ({ value: String(y), label: String(y) })),
        value: String(year),
        onChange: (v: string) => setYear(Number(v)),
      },
      {
        key: 'month',
        options: months.map((m) => ({ value: m, label: m })),
        value: pad2(month),
        onChange: (v: string) => setMonth(Number(v)),
      },
      {
        key: 'day',
        options: days.map((d) => ({ value: d, label: d })),
        value: pad2(day),
        onChange: (v: string) => setDay(Number(v)),
      },
    );
    if (timeFormat) {
      list.push(
        {
          key: 'hour',
          options: hours.map((h) => ({ value: h, label: h })),
          value: pad2(hour),
          onChange: (v: string) => setHour(Number(v)),
        },
        {
          key: 'minute',
          options: minutes.map((m) => ({ value: m, label: m })),
          value: pad2(minute),
          onChange: (v: string) => setMinute(Number(v)),
        },
      );
      if (withSeconds) {
        list.push({
          key: 'second',
          options: minutes.map((s) => ({ value: s, label: s })),
          value: pad2(second),
          onChange: (v: string) => setSecond(Number(v)),
        });
      }
    }
    return list;
  })();

  return (
    <>
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={<span className="tabular-nums">{display}</span>}
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.(emptyDateValue(range));
          setOpen(false);
        }}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Portal>
        <Overlay open={open} onClick={() => setOpen(false)}>
          <div className="flex h-full items-end">
            <MotionPanel
              variant="bottom"
              className="w-full rounded-t-[14px] bg-surface pb-safe shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={title}
                onCancel={() => setOpen(false)}
                onConfirm={confirm}
                cancelText={messages.cancelActionText}
                confirmText={
                  range && rangeStep === 'start'
                    ? locale === 'en-US'
                      ? 'Next'
                      : '下一步'
                    : locale === 'en-US'
                      ? 'Done'
                      : '完成'
                }
              >
                <div className="px-3 pb-6 pt-1" data-picker-panel="mobile">
                  <PickerWheels
                    mode="drum"
                    maxVisibleRows={5}
                    columns={columns}
                  />
                </div>
              </SheetChrome>
            </MotionPanel>
          </div>
        </Overlay>
      </Portal>
    </>
  );
}
