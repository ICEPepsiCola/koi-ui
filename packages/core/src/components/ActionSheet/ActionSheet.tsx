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
  /** Error action. */
  color?: 'error';
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
  /**
   * @default true
   */
  maskClosable?: boolean;
}

export function ActionSheet({
  open,
  onClose,
  title,
  description,
  actions,
  cancelText,
  closeOnAction = true,
  maskClosable = true,
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
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className="grid place-items-end"
      >
        <MotionPanel
          ref={sheetRef}
          variant="bottom"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={title || description ? descriptionId : undefined}
          tabIndex={-1}
          className={cn(
            'w-full rounded-t-box bg-surface pb-safe',
            'shadow-2xl',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
          {title || description ? (
            <div
              id={title || description ? descriptionId : undefined}
              className="px-4 pb-2 pt-3 text-center"
            >
              {title ? (
                <div id={titleId} className="text-sm font-semibold">
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
          <div className="px-2 pb-2">
            <div className="overflow-hidden rounded-box bg-muted/40">
              {actions.map((action, index) => {
                const isDanger = action.color === 'error';
                return (
                  <button
                    key={action.key}
                    type="button"
                    disabled={action.disabled}
                    className={cn(
                      'w-full px-4 py-3.5 text-center text-base',
                      controlTransition,
                      pressable,
                      'hover:bg-muted/80',
                      index > 0 && 'border-t border-border/60',
                      isDanger && 'text-error',
                      action.disabled && 'cursor-not-allowed opacity-50',
                    )}
                    onClick={() => {
                      action.onClick?.();
                      if (closeOnAction) onClose();
                    }}
                  >
                    {action.text}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className={cn(
                'mt-2 w-full rounded-box bg-muted/40 px-4 py-3.5 text-center text-base font-semibold',
                controlTransition,
                pressable,
                'hover:bg-muted/80',
              )}
              onClick={onClose}
            >
              {resolvedCancelText}
            </button>
          </div>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
