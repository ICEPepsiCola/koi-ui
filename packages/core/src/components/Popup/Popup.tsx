import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';

export interface PopupProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnMask?: boolean;
  className?: string;
}

export function Popup({
  open,
  onClose,
  title,
  children,
  footer,
  closeOnMask = true,
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

  if (!open) return null;

  return (
    <Portal>
      <Overlay open onClick={closeOnMask ? onClose : undefined}>
        <div className="flex h-full items-center justify-center p-6">
          <div
            ref={popupRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className={cn(
              'w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg',
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <div
                id={titleId}
                className="px-4 py-3 text-center text-base font-semibold"
              >
                {title}
              </div>
            ) : null}
            <div id={descriptionId} className="px-4 py-2 text-center text-sm">
              {children}
            </div>
            {footer ? (
              <div className="border-t border-border">{footer}</div>
            ) : null}
          </div>
        </div>
      </Overlay>
    </Portal>
  );
}

export function PopupView(props: PopupProps) {
  return <Popup {...props} />;
}
