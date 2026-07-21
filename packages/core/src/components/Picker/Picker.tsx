import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { PickerDropdownView } from './PickerDropdownView';
import { PickerWheelView } from './PickerWheelView';

export interface PickerOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface PickerColumn {
  options: PickerOption[];
}

export interface PickerProps {
  columns: PickerColumn[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  responsive?: boolean;
}

export function Picker({ responsive = true, ...props }: PickerProps) {
  return (
    <AdaptiveRender
      desktop={PickerDropdownView}
      mobile={PickerWheelView}
      props={props}
      responsive={responsive}
    />
  );
}
