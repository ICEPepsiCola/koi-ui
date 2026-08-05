import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { BottomPickerView } from './BottomPickerView';
import { CalendarView } from './CalendarView';
import type { DatePickerProps, RangePickerProps } from './types';

export type {
  DatePickerPlaceholder,
  DatePickerProps,
  DatePickerType,
  DatePickerValue,
  RangePickerProps,
  TimeFormat,
} from './types';

function DatePickerInner({ responsive = true, ...props }: DatePickerProps) {
  return (
    <AdaptiveRender
      desktop={CalendarView}
      mobile={BottomPickerView}
      props={props}
      responsive={responsive}
    />
  );
}

function RangePicker({ ...props }: RangePickerProps) {
  return (
    <DatePickerInner
      {...props}
      range
      value={props.value}
      onChange={props.onChange as DatePickerProps['onChange']}
    />
  );
}

export const DatePicker = Object.assign(DatePickerInner, {
  RangePicker,
});
