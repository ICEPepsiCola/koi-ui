import { useId, useRef, type ReactNode } from 'react';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';

export interface ModalViewProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function ModalView({
  open,
  onClose,
  title,
  children,
  footer,
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
      <Overlay open={open} onClick={onClose}>
        <div className="flex h-full items-center justify-center p-4">
          <MotionPanel
            ref={dialogRef}
            variant="center"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="w-full max-w-lg rounded-box border border-border/80 bg-surface shadow-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <div
                id={titleId}
                className="border-b border-border/80 px-6 py-4 text-lg font-semibold"
              >
                {title}
              </div>
            ) : null}
            <div id={descriptionId} className="px-6 py-4">
              {children}
            </div>
            {footer ? (
              <div className="flex justify-end gap-2 border-t border-border/80 px-6 py-4">
                {footer}
              </div>
            ) : null}
          </MotionPanel>
        </div>
      </Overlay>
    </Portal>
  );
}
