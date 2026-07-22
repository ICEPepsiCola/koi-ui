import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import type { FieldSize } from '../../utils/interaction';
import { BottomSheetView } from './BottomSheetView';
import { SelectView, type SelectOption } from './SelectView';

export type { SelectOption };

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  responsive?: boolean;
  size?: FieldSize;
}

export function Select({ responsive = true, ...props }: SelectProps) {
  return (
    <AdaptiveRender
      desktop={SelectView}
      mobile={BottomSheetView}
      props={props}
      responsive={responsive}
    />
  );
}
