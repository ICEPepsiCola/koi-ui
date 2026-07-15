import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';

export interface ActionSheetAction {
  key: string;
  text: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}

export interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  actions: ActionSheetAction[];
  cancelText?: ReactNode;
  closeOnAction?: boolean;
}

export function ActionSheet({
  open,
  onClose,
  title,
  description,
  actions,
  cancelText,
  closeOnAction = true,
}: ActionSheetProps) {
  const { messages } = useKoiContext();
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const resolvedCancelText = cancelText ?? messages.cancelActionText;

  useScrollLock(open);
  useDismissibleLayer({
    open,
    onDismiss: onClose,
    containerRef: sheetRef,
  });
  useFocusTrap({
    active: open,
    containerRef: sheetRef,
  });

  if (!open) return null;

  return (
    <Portal>
      <Overlay open onClick={onClose}>
        <div className="flex h-full items-end">
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={title || description ? descriptionId : undefined}
            tabIndex={-1}
            className="w-full rounded-t-xl bg-surface pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {title || description ? (
              <div
                id={title || description ? descriptionId : undefined}
                className="border-b border-border px-4 py-3 text-center"
              >
                {title ? (
                  <div id={titleId} className="text-sm font-medium">
                    {title}
                  </div>
                ) : null}
                {description ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="divide-y divide-border">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  disabled={action.disabled}
                  className={cn(
                    'w-full px-4 py-3.5 text-center text-base',
                    action.destructive && 'text-destructive',
                    action.disabled && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={() => {
                    action.onClick?.();
                    if (closeOnAction) onClose();
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full border-t border-border px-4 py-3.5 text-center text-base font-medium"
              onClick={onClose}
            >
              {resolvedCancelText}
            </button>
          </div>
        </div>
      </Overlay>
    </Portal>
  );
}
