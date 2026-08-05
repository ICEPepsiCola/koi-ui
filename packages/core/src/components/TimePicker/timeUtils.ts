import { pad2 } from '../DatePicker/dateUtils';
import type { TimePickerValue } from './TimePicker';

export function parseTime(value?: string) {
  const parts = (value ?? '').split(':').map(Number);
  return {
    hour: Number.isFinite(parts[0]) ? parts[0]! : 0,
    minute: Number.isFinite(parts[1]) ? parts[1]! : 0,
    second: Number.isFinite(parts[2]) ? parts[2]! : 0,
  };
}

export function formatTime(
  hour: number,
  minute: number,
  second: number,
  withSeconds: boolean,
) {
  return withSeconds
    ? `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`
    : `${pad2(hour)}:${pad2(minute)}`;
}

export function asSingleTime(value?: TimePickerValue) {
  return typeof value === 'string' ? value : value?.[0];
}

export function asRangeTime(value?: TimePickerValue): [string, string] {
  if (Array.isArray(value)) return [value[0] ?? '', value[1] ?? ''];
  return ['', ''];
}

export function displayTimeValue(value?: TimePickerValue, range = false) {
  if (!value) return '';
  if (range && Array.isArray(value)) {
    const [start, end] = value;
    if (!start && !end) return '';
    if (start && end) return `${start} ~ ${end}`;
    return start || end || '';
  }
  return typeof value === 'string' ? value : '';
}

export function emptyTimeValue(range: boolean): TimePickerValue {
  return range ? ['', ''] : '';
}
