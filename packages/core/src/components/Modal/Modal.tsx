import type { ReactNode } from 'react';
import { AdaptiveRender } from '../../adaptive/AdaptiveRender';
import { DrawerView } from './DrawerView';
import { ModalView } from './ModalView';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  mobileFullscreen?: boolean;
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
