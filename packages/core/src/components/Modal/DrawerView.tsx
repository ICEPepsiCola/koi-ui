import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';

export interface DrawerViewProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  mobileFullscreen?: boolean;
}

export function DrawerView({
  open,
  onClose,
  title,
  children,
  footer,
  mobileFullscreen = true,
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

  if (!open) return null;

  return (
    <Portal>
      <Overlay open onClick={onClose} className="flex items-end">
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            'w-full rounded-t-lg border border-border bg-surface shadow-md transition-transform',
            mobileFullscreen ? 'max-h-[90vh]' : 'max-h-[70vh]',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto my-2 h-1 w-10 rounded-full bg-border" />
          {title ? (
            <div
              id={titleId}
              className="border-b border-border px-4 py-3 text-lg font-semibold"
            >
              {title}
            </div>
          ) : null}
          <div id={descriptionId} className="overflow-y-auto px-4 py-4">
            {children}
          </div>
          {footer ? (
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </Overlay>
    </Portal>
  );
}
