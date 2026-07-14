import type { ReactNode } from 'react';
import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { ActionSheetView } from './ActionSheetView';
import { DropdownView, type DropdownItem } from './DropdownView';

export type { DropdownItem };

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  title?: ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  disabled?: boolean;
  responsive?: boolean;
  onSelect?: (key: string) => void;
}

export function Dropdown({ responsive = true, ...props }: DropdownProps) {
  return (
    <AdaptiveRender
      desktop={DropdownView}
      mobile={ActionSheetView}
      props={props}
      responsive={responsive}
    />
  );
}
