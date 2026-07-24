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
          className="w-full rounded-t-[14px] bg-muted pb-safe shadow-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-border/80" />
          {title || description ? (
            <div
              id={title || description ? descriptionId : undefined}
              className="px-4 pb-1 pt-3 text-center"
            >
              {title ? (
                <div
                  id={titleId}
                  className="text-sm font-semibold text-surface-foreground"
                >
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
          <div className="flex flex-col gap-2.5 px-3 pb-3 pt-2">
            <div className="overflow-hidden rounded-[12px] bg-surface">
              {actions.map((action, index) => {
                const isDanger = action.color === 'error';
                return (
                  <button
                    key={action.key}
                    type="button"
                    disabled={action.disabled}
                    className={cn(
                      'w-full px-4 py-3.5 text-center text-[15px] font-normal text-surface-foreground',
                      controlTransition,
                      pressable,
                      'hover:bg-muted/60 active:bg-muted',
                      index > 0 && 'border-t border-border/70',
                      isDanger && 'font-medium text-error',
                      action.disabled && 'cursor-not-allowed opacity-40',
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
                'w-full rounded-[12px] px-4 py-3.5 text-center text-[15px] font-semibold text-primary',
                controlTransition,
                pressable,
                'hover:bg-surface/60 active:bg-surface/80',
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
