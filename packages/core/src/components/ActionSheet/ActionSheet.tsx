import { useId, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { controlTransition, pressable } from '../../utils/interaction';
import { MotionPanel } from '../shared/MotionPanel';
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

  return (
    <Portal>
      <Overlay open={open} onClick={onClose}>
        <div className="flex h-full items-end">
          <MotionPanel
            ref={sheetRef}
            variant="bottom"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={title || description ? descriptionId : undefined}
            tabIndex={-1}
            className="w-full rounded-t-box bg-surface pb-safe shadow-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            {title || description ? (
              <div
                id={title || description ? descriptionId : undefined}
                className="border-b border-border/80 px-4 py-3 text-center"
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
            <div className="divide-y divide-border/80">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  disabled={action.disabled}
                  className={cn(
                    'w-full px-4 py-3.5 text-center text-base',
                    controlTransition,
                    pressable,
                    'hover:bg-muted/70',
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
              className={cn(
                'mt-2 w-full border-t border-border/80 px-4 py-3.5 text-center text-base font-medium',
                controlTransition,
                pressable,
                'hover:bg-muted/70',
              )}
              onClick={onClose}
            >
              {resolvedCancelText}
            </button>
          </MotionPanel>
        </div>
      </Overlay>
    </Portal>
  );
}
