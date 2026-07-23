import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { DrawerView } from './DrawerView';
import { ModalView } from './ModalView';
import type { ModalPlacement, ModalSize } from './modalStyles';
import type { ModalPanelProps } from './types';

export type { ModalPlacement, ModalSize };

export interface ModalProps extends ModalPanelProps {
  /**
   * Switch to bottom sheet on mobile breakpoint.
   * @default true
   */
  responsive?: boolean;
}

export function Modal(props: ModalProps) {
  const { responsive = true, ...rest } = props;

  return (
    <AdaptiveRender
      desktop={ModalView}
      mobile={DrawerView}
      props={rest}
      responsive={responsive}
    />
  );
}
