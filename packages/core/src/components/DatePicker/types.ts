import type { FieldSize } from '../../utils/interaction';

export type DatePickerType = 'date' | 'week' | 'month' | 'year';

export type DatePickerValue = string | [string, string];

export type TimeFormat = 'HH:mm' | 'HH:mm:ss';

export interface DatePickerProps {
  /**
   * Selection granularity.
   * @default 'date'
   * @since 1.14.0
   */
  picker?: DatePickerType;
  /**
   * Select a start/end pair. Value becomes `[start, end]`.
   * @since 1.14.0
   */
  range?: boolean;
  /**
   * Append time to date values (`YYYY-MM-DD HH:mm[:ss]`). Only with `picker="date"`.
   * @since 1.14.0
   */
  showTime?: boolean | { format?: TimeFormat };
  value?: DatePickerValue;
  onChange?: (value: DatePickerValue) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  clearable?: boolean;
  responsive?: boolean;
  size?: FieldSize;
}

export function resolveTimeFormat(
  showTime: DatePickerProps['showTime'],
): TimeFormat | null {
  if (!showTime) return null;
  if (showTime === true) return 'HH:mm';
  return showTime.format ?? 'HH:mm';
}
