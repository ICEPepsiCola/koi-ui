import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { animate } from 'motion/react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useVerticalDrag } from '../../hooks/useVerticalDrag';
import {
  shouldDismissProjected,
  SHEET_DISMISS_OFFSET,
  SHEET_DISMISS_VELOCITY,
} from '../../motion/gesture';
import { springMomentum } from '../../motion/presets';
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
  /**
   * Drag the handle downward to dismiss.
   * @breaking Release uses projected offset (`project`) and px/s velocity via
   * shared `shouldDismiss` (defaults: 96px / 550px/s), not local px/ms math.
   * @default true
   * @since 1.14.0
   */
  closeOnDrag?: boolean;
}

/** @internal Exported for dismiss-threshold unit tests. */
export function shouldDismissActionSheet(options: {
  offset: number;
  velocity: number;
}): boolean {
  return shouldDismissProjected({
    offset: options.offset,
    velocity: options.velocity,
    dismissOffset: SHEET_DISMISS_OFFSET,
    dismissVelocity: SHEET_DISMISS_VELOCITY,
  });
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
  closeOnDrag = true,
}: ActionSheetProps) {
  const { messages } = useKoiContext();
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const resolvedCancelText = cancelText ?? messages.cancelActionText;
  const onCloseRef = useRef(onClose);
  const springRef = useRef<{ stop: () => void } | null>(null);
  const setOffsetRef = useRef<(value: number) => void>(() => {});

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const stopSpring = useCallback(() => {
    springRef.current?.stop();
    springRef.current = null;
  }, []);

  const handleDragEnd = useCallback(
    ({ offset, velocity }: { offset: number; velocity: number }) => {
      if (
        shouldDismissActionSheet({
          offset,
          velocity,
        })
      ) {
        onCloseRef.current();
        return;
      }

      stopSpring();
      springRef.current = animate(offset, 0, {
        ...springMomentum,
        velocity,
        onUpdate: (value) => {
          setOffsetRef.current(value);
        },
        onComplete: () => {
          springRef.current = null;
        },
      });
    },
    [stopSpring],
  );

  const {
    offset: dragY,
    setOffset,
    dragging,
    onPointerDown: dragPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useVerticalDrag({
    enabled: closeOnDrag && open,
    min: 0,
    dimension:
      typeof window !== 'undefined' ? window.innerHeight : 400,
    onDragEnd: handleDragEnd,
  });

  useEffect(() => {
    setOffsetRef.current = setOffset;
  }, [setOffset]);

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

  useEffect(() => {
    if (!open) {
      stopSpring();
      setOffset(0);
    }
  }, [open, setOffset, stopSpring]);

  const onPointerDown = (event: Parameters<typeof dragPointerDown>[0]) => {
    stopSpring();
    dragPointerDown(event);
  };

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
          className="w-full overflow-hidden rounded-t-[14px] bg-muted pb-safe shadow-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              transform: `translateY(${dragY}px)`,
              // Interruptible spring owns settle; disable CSS while dragging.
              transition: dragging ? 'none' : undefined,
            }}
          >
            <div
              className={cn(
                'flex touch-none flex-col items-center pb-1 pt-2.5',
                closeOnDrag && 'cursor-grab active:cursor-grabbing',
              )}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              data-actionsheet-handle
            >
              <div className="h-1 w-9 shrink-0 rounded-full bg-border/80" />
            </div>
            {title || description ? (
              <div
                id={title || description ? descriptionId : undefined}
                className="px-4 pb-1 pt-1 text-center"
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
          </div>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
