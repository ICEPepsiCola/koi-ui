import type { ReactNode } from 'react';
import type { ModalPlacement, ModalSize } from './modalStyles';

/** Props shared by desktop ModalView and mobile DrawerView. */
export interface ModalPanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * Desktop placement. Mobile adaptive path always uses bottom sheet.
   * @default 'middle'
   */
  placement?: ModalPlacement;
  /**
   * @default 'md'
   */
  size?: ModalSize;
  /**
   * @default false
   */
  closable?: boolean;
  /**
   * @default true
   */
  maskClosable?: boolean;
  /**
   * Mobile bottom sheet: drag the handle downward to dismiss.
   * Uses shared projection + px/s velocity thresholds (96px / 550px/s).
   * Ignored on desktop.
   * @default true
   */
  closeOnDrag?: boolean;
  /**
   * Mobile sheet height. Ignored on desktop.
   * @default true
   */
  mobileFullscreen?: boolean;
  className?: string;
}
