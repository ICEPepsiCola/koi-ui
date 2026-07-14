import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
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

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <Overlay open onClick={onClose}>
        <div className="flex h-full items-center justify-center p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'koi-modal-title' : undefined}
            className={cn(
              'w-full max-w-lg rounded-lg border border-border bg-surface shadow-md',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <div
                id="koi-modal-title"
                className="border-b border-border px-6 py-4 text-lg font-semibold"
              >
                {title}
              </div>
            ) : null}
            <div className="px-6 py-4">{children}</div>
            {footer ? (
              <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </Overlay>
    </Portal>
  );
}
