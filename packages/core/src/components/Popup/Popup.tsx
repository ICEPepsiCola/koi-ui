import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import {
  ModalBoxContent,
  modalBoxVariants,
  type ModalSize,
} from '../Modal/modalStyles';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';

export interface PopupProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * Compact centered dialog (defaults to `sm`).
   * @default 'sm'
   */
  size?: ModalSize;
  /**
   * Corner close button.
   * @default false
   */
  closable?: boolean;
  /**
   * Close when clicking the mask.
   * @default true
   */
  maskClosable?: boolean;
  className?: string;
}

/**
 * Compact centered dialog — same chrome as Modal, smaller default size.
 */
export function Popup({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'sm',
  closable = false,
  maskClosable = true,
  className,
}: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);
  useDismissibleLayer({
    open,
    onDismiss: onClose,
    containerRef: popupRef,
  });
  useFocusTrap({
    active: open,
    containerRef: popupRef,
  });

  return (
    <Portal>
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className="grid h-full place-items-center p-4"
      >
        <MotionPanel
          ref={popupRef}
          variant="center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            modalBoxVariants({ placement: 'middle', size }),
            'text-center',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalBoxContent
            title={title}
            footer={footer}
            closable={closable}
            onClose={onClose}
            titleId={titleId}
            descriptionId={descriptionId}
          >
            {children}
          </ModalBoxContent>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}

export function PopupView(props: PopupProps) {
  return <Popup {...props} />;
}
