import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import type { FieldSize } from '../../utils/interaction';
import { BottomPickerView } from './BottomPickerView';
import { CalendarView } from './CalendarView';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  clearable?: boolean;
  responsive?: boolean;
  size?: FieldSize;
}

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
