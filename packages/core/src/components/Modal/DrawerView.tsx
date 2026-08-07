import { useId, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useBottomSheetDismiss } from '../../hooks/useBottomSheetDismiss';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { ModalBoxContent } from './modalStyles';
import type { ModalPanelProps } from './types';

export type DrawerViewProps = ModalPanelProps;

export function DrawerView({
  open,
  onClose,
  title,
  children,
  footer,
  mobileFullscreen = true,
  size: _size = 'md',
  closable = false,
  maskClosable = true,
  closeOnDrag = true,
  className,
}: DrawerViewProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const {
    contentStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useBottomSheetDismiss({
    open,
    enabled: closeOnDrag,
    onDismiss: onClose,
  });

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

  const dragHandle = closeOnDrag ? (
    <div
      className="flex shrink-0 touch-none cursor-grab justify-center py-1 active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-modal-drawer-handle
    >
      <div className="h-1 w-10 shrink-0 rounded-full bg-border" />
    </div>
  ) : (
    <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border" />
  );

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
            // Layout only — sheetSurface (MotionPanel) owns radius / material / shadow / pb-safe.
            // Do not use modalBoxVariants bottom: its bg-surface + rounded-t-box override HIG sheet.
            // Use px/pt only so `p-*` does not clobber sheetSurface `pb-safe`.
            'relative w-full max-w-none min-h-0 overflow-y-auto overscroll-contain px-6 pt-6 text-surface-foreground',
            mobileFullscreen ? 'max-h-[90vh]' : 'max-h-[70vh]',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              ...contentStyle,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: '100%',
            }}
          >
            {dragHandle}
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
          </div>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
