import { useId, useRef } from 'react';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import {
  ModalBoxContent,
  modalBoxVariants,
  placementOverlayClass,
  placementToMotion,
} from './modalStyles';
import type { ModalPanelProps } from './types';

export type ModalViewProps = ModalPanelProps;

export function ModalView({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'middle',
  size = 'md',
  closable = false,
  maskClosable = true,
  className,
}: ModalViewProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);
  useDismissibleLayer({
    open,
    onDismiss: onClose,
    containerRef: dialogRef,
  });
  useFocusTrap({
    active: open,
    containerRef: dialogRef,
  });

  return (
    <Portal>
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className={cn('h-full', placementOverlayClass[placement])}
      >
        <MotionPanel
          ref={dialogRef}
          variant={placementToMotion[placement]}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(modalBoxVariants({ placement, size }), className)}
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
