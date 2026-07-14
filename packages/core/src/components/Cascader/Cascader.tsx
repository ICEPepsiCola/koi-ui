import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { CascaderDropdownView } from './CascaderDropdownView';
import { CascaderSheetView } from './CascaderSheetView';

export interface CascaderOption {
  label: string;
  value: string;
  disabled?: boolean;
  children?: CascaderOption[];
}

export interface CascaderProps {
  options: CascaderOption[];
  value?: string[];
  onChange?: (value: string[], labels: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  responsive?: boolean;
}

export function Cascader({ responsive = true, ...props }: CascaderProps) {
  return (
    <AdaptiveRender
      desktop={CascaderDropdownView}
      mobile={CascaderSheetView}
      props={props}
      responsive={responsive}
    />
  );
}
