import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { TimeDropdownView } from './TimeDropdownView';
import { TimeWheelView } from './TimeWheelView';

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: 'HH:mm' | 'HH:mm:ss';
  clearable?: boolean;
  responsive?: boolean;
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
