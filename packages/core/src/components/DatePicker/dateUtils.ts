export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatMonth(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function formatYear(date: Date) {
  return String(date.getFullYear());
}

/** ISO week: `YYYY-Www` */
export function formatWeek(date: Date) {
  const { year, week } = getISOWeekParts(date);
  return `${year}-W${pad2(week)}`;
}

export function formatDateTime(
  date: Date,
  timeFormat: 'HH:mm' | 'HH:mm:ss' = 'HH:mm',
) {
  const time =
    timeFormat === 'HH:mm:ss'
      ? `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
      : `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return `${formatDate(date)} ${time}`;
}

export function parseDate(value?: string) {
  if (!value) return null;
  const datePart = value.trim().split(/\s+/)[0] ?? '';
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function parseMonth(value?: string) {
  if (!value) return null;
  const [y, m] = value.split('-').map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
}

export function parseYear(value?: string) {
  if (!value) return null;
  const y = Number(value);
  if (!Number.isFinite(y)) return null;
  return new Date(y, 0, 1);
}

export function parseWeek(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-W(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!year || !week) return null;
  return getDateOfISOWeek(year, week);
}

export function parseDateTime(value?: string) {
  if (!value) return null;
  const [datePart, timePart = '00:00:00'] = value.trim().split(/\s+/);
  const date = parseDate(datePart);
  if (!date) return null;
  const [h = 0, m = 0, s = 0] = timePart.split(':').map(Number);
  date.setHours(h || 0, m || 0, s || 0, 0);
  return date;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isInRange(date: Date, start?: Date | null, end?: Date | null) {
  if (!start || !end) return false;
  const t = startOfDay(date).getTime();
  const a = startOfDay(start).getTime();
  const b = startOfDay(end).getTime();
  return t >= Math.min(a, b) && t <= Math.max(a, b);
}

export function getWeekdays(locale: 'zh-CN' | 'en-US') {
  if (locale === 'en-US') {
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  }
  return ['日', '一', '二', '三', '四', '五', '六'];
}

export function formatMonthLabel(
  year: number,
  month: number,
  locale: 'zh-CN' | 'en-US',
) {
  if (locale === 'en-US') {
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }
  return `${year}年${month}月`;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const days = getDaysInMonth(year, month);
  const cells: Array<number | null> = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** Monday-based ISO week number. */
export function getISOWeekParts(date: Date) {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return { year: tmp.getFullYear(), week };
}

export function getDateOfISOWeek(weekYear: number, week: number) {
  const jan4 = new Date(weekYear, 0, 4);
  const day = jan4.getDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - (day - 1));
  const result = new Date(mondayWeek1);
  result.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  return result;
}

export function getISOWeekCount(year: number) {
  return getISOWeekParts(new Date(year, 11, 28)).week;
}

export function weeksEqual(a: Date, b: Date) {
  const wa = getISOWeekParts(a);
  const wb = getISOWeekParts(b);
  return wa.year === wb.year && wa.week === wb.week;
}

export function displayDateValue(
  value: string | [string, string] | undefined,
  range: boolean,
) {
  if (!value) return '';
  if (range && Array.isArray(value)) {
    const [start, end] = value;
    if (!start && !end) return '';
    if (start && end) return `${start} ~ ${end}`;
    return start || end || '';
  }
  return typeof value === 'string' ? value : '';
}

export function emptyDateValue(range: boolean): string | [string, string] {
  return range ? ['', ''] : '';
}
