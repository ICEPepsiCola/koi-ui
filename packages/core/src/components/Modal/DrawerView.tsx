import { useId, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { ModalBoxContent, modalBoxVariants } from './modalStyles';
import type { ModalPanelProps } from './types';

export type DrawerViewProps = ModalPanelProps;

export function DrawerView({
  open,
  onClose,
  title,
  children,
  footer,
  mobileFullscreen = true,
  size = 'md',
  closable = false,
  maskClosable = true,
  className,
}: DrawerViewProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);
  useDismissibleLayer({
    open,
    onDismiss: onClose,
    containerRef: drawerRef,
  });
  useFocusTrap({
    active: open,
    containerRef: drawerRef,
  });

  return (
    <Portal>
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className="grid place-items-end"
      >
        <MotionPanel
          ref={drawerRef}
          variant="bottom"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            modalBoxVariants({ placement: 'bottom', size }),
            'w-full max-w-none',
            mobileFullscreen ? 'max-h-[90vh]' : 'max-h-[70vh]',
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
            headerExtra={
              <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border" />
            }
          >
            {children}
          </ModalBoxContent>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
