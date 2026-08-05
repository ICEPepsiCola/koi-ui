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
   * Prefer `DatePicker.RangePicker` when you want a dedicated range API.
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
  /**
   * Disable individual dates (in addition to `min` / `max`).
   * Same idea as Calendar / Ant Design `disabledDate`.
   * @since 1.14.0
   */
  disabledDate?: (date: Date) => boolean;
  clearable?: boolean;
  responsive?: boolean;
  size?: FieldSize;
}

/** Dedicated range props — value is always a tuple. */
export type RangePickerProps = Omit<DatePickerProps, 'range' | 'value' | 'onChange'> & {
  value?: [string, string];
  onChange?: (value: [string, string]) => void;
};

export function resolveTimeFormat(
  showTime: DatePickerProps['showTime'],
): TimeFormat | null {
  if (!showTime) return null;
  if (showTime === true) return 'HH:mm';
  return showTime.format ?? 'HH:mm';
}
