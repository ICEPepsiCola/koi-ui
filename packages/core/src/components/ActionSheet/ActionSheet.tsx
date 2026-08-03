import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { MOTION_DURATION_S } from '../../motion/presets';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { controlTransition, pressable } from '../../utils/interaction';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';

const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = 0.55;

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
   * @default true
   * @since 1.14.0
   */
  closeOnDrag?: boolean;
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

  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragYRef = useRef(0);
  const startY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const activePointerId = useRef<number | null>(null);

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
      dragYRef.current = 0;
      setDragY(0);
      setDragging(false);
      activePointerId.current = null;
    }
  }, [open]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!closeOnDrag || e.button !== 0) return;
    activePointerId.current = e.pointerId;
    startY.current = e.clientY;
    lastY.current = e.clientY;
    lastT.current = performance.now();
    velocity.current = 0;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!closeOnDrag || activePointerId.current !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    velocity.current = (e.clientY - lastY.current) / dt;
    lastY.current = e.clientY;
    lastT.current = now;
    const next = Math.max(0, e.clientY - startY.current);
    dragYRef.current = next;
    setDragY(next);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
    const shouldClose =
      dragYRef.current >= CLOSE_DISTANCE ||
      velocity.current >= CLOSE_VELOCITY;
    if (shouldClose) {
      onClose();
      return;
    }
    dragYRef.current = 0;
    setDragY(0);
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
              transition: dragging
                ? 'none'
                : `transform ${MOTION_DURATION_S}s cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          >
            <div
              className={cn(
                'flex touch-none flex-col items-center pb-1 pt-2.5',
                closeOnDrag && 'cursor-grab active:cursor-grabbing',
              )}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
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
