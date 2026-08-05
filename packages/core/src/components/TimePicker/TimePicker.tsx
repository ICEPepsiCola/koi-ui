import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import type { FieldSize } from '../../utils/interaction';
import { TimeDropdownView } from './TimeDropdownView';
import { TimeWheelView } from './TimeWheelView';

export type TimePickerValue = string | [string, string];

export interface TimePickerProps {
  value?: TimePickerValue;
  onChange?: (value: TimePickerValue) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
  clearable?: boolean;
  responsive?: boolean;
  size?: FieldSize;
  /**
   * Select a start/end time pair.
   * @since 1.14.0
   */
  range?: boolean;
}

export function TimePicker({ responsive = true, ...props }: TimePickerProps) {
  return (
    <AdaptiveRender
      desktop={TimeDropdownView}
      mobile={TimeWheelView}
      props={props}
      responsive={responsive}
    />
  );
}
