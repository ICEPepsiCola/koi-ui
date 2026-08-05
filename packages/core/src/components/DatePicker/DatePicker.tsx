import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { BottomPickerView } from './BottomPickerView';
import { CalendarView } from './CalendarView';
import type { DatePickerProps } from './types';

export type {
  DatePickerProps,
  DatePickerType,
  DatePickerValue,
  TimeFormat,
} from './types';

export function DatePicker({ responsive = true, ...props }: DatePickerProps) {
  return (
    <AdaptiveRender
      desktop={CalendarView}
      mobile={BottomPickerView}
      props={props}
      responsive={responsive}
    />
  );
}
