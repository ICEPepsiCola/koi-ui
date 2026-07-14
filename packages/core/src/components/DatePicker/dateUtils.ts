export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDate(value?: string) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
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

export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
