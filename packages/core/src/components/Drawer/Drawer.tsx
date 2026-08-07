import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { animate } from 'motion/react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import {
  useVerticalDrag,
  type DragAxis,
} from '../../hooks/useVerticalDrag';
import {
  shouldDismissProjected,
  SHEET_DISMISS_OFFSET,
  SHEET_DISMISS_VELOCITY,
} from '../../motion/gesture';
import { springMomentum } from '../../motion/presets';
import { Portal } from '../../utils/portal';
import { ModalBoxContent } from '../Modal/modalStyles';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';

const drawerVariants = tv({
  base: cn(
    'relative flex flex-col overflow-hidden bg-surface text-surface-foreground',
    'shadow-[0_25px_50px_-12px_rgb(0_0_0_/_0.25)]',
  ),
  variants: {
    placement: {
      left: 'h-full rounded-r-box rounded-l-none',
      right: 'h-full rounded-l-box rounded-r-none',
      top: 'w-full rounded-b-box rounded-t-none',
      bottom: 'w-full rounded-t-box rounded-b-none',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    placement: 'right',
    size: 'md',
  },
});

const sizeMap = {
  left: { sm: 'w-64', md: 'w-80', lg: 'w-96' },
  right: { sm: 'w-64', md: 'w-80', lg: 'w-96' },
  top: { sm: 'h-48', md: 'h-64', lg: 'h-80' },
  bottom: { sm: 'h-48', md: 'max-h-[70vh]', lg: 'max-h-[90vh]' },
} as const;

const overlayClass = {
  left: 'grid h-full place-items-stretch justify-items-start',
  right: 'grid h-full place-items-stretch justify-items-end',
  top: 'grid h-full place-items-start',
  bottom: 'grid h-full place-items-end',
} as const;

type DrawerPlacement = NonNullable<
  VariantProps<typeof drawerVariants>['placement']
>;

const placementDrag: Record<
  DrawerPlacement,
  { axis: DragAxis; sign: 1 | -1 }
> = {
  bottom: { axis: 'y', sign: 1 },
  top: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: 1 },
  left: { axis: 'x', sign: -1 },
};

export interface DrawerProps extends VariantProps<typeof drawerVariants> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * @default true
   */
  maskClosable?: boolean;
  /**
   * @default false
   */
  closable?: boolean;
  /**
   * Drag the edge handle toward the placement edge to dismiss.
   * @breaking Edge drag uses shared projection + px/s velocity thresholds
   * (96px / 550px/s) with rubber-band past the open rest and interruptible spring.
   * @default true
   */
  closeOnDrag?: boolean;
  className?: string;
}

/** @internal Exported for dismiss-threshold unit tests. */
export function shouldDismissDrawer(options: {
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

function dragTransform(
  placement: DrawerPlacement,
  offset: number,
): string {
  const { axis, sign } = placementDrag[placement];
  const value = sign * offset;
  return axis === 'y' ? `translateY(${value}px)` : `translateX(${value}px)`;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'right',
  size = 'md',
  maskClosable = true,
  closable = false,
  closeOnDrag = true,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const resolvedPlacement = placement ?? 'right';
  const resolvedSize = size ?? 'md';
  const { axis, sign } = placementDrag[resolvedPlacement];
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
      if (shouldDismissDrawer({ offset, velocity })) {
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
    offset,
    setOffset,
    dragging,
    onPointerDown: dragPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useVerticalDrag({
    enabled: closeOnDrag && open,
    axis,
    sign,
    min: 0,
    dimension:
      typeof window !== 'undefined'
        ? axis === 'y'
          ? window.innerHeight
          : window.innerWidth
        : 400,
    onDragEnd: handleDragEnd,
  });

  useEffect(() => {
    setOffsetRef.current = setOffset;
  }, [setOffset]);

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

  useEffect(() => {
    if (!open) {
      stopSpring();
      setOffset(0);
    }
  }, [open, setOffset, stopSpring]);

  useEffect(() => {
    stopSpring();
    setOffset(0);
  }, [resolvedPlacement, setOffset, stopSpring]);

  const onPointerDown = (event: Parameters<typeof dragPointerDown>[0]) => {
    stopSpring();
    dragPointerDown(event);
  };

  const sizeClass = sizeMap[resolvedPlacement][resolvedSize];
  const isVerticalEdge =
    resolvedPlacement === 'bottom' || resolvedPlacement === 'top';
  const dragHandle = closeOnDrag ? (
    <div
      className={cn(
        'touch-none cursor-grab active:cursor-grabbing',
        isVerticalEdge
          ? 'flex shrink-0 justify-center py-1'
          : 'absolute inset-y-0 z-10 w-3',
        resolvedPlacement === 'left' && 'right-0',
        resolvedPlacement === 'right' && 'left-0',
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-drawer-drag-handle
    >
      {isVerticalEdge ? (
        <div className="h-1 w-10 shrink-0 rounded-full bg-border" />
      ) : null}
    </div>
  ) : resolvedPlacement === 'bottom' ? (
    <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border" />
  ) : null;

  return (
    <Portal>
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className={overlayClass[resolvedPlacement]}
      >
        <MotionPanel
          ref={drawerRef}
          variant={resolvedPlacement}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            drawerVariants({
              placement: resolvedPlacement,
              size: resolvedSize,
            }),
            sizeClass,
            'p-6',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              transform: dragTransform(resolvedPlacement, offset),
              transition: dragging ? 'none' : undefined,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              position: 'relative',
            }}
          >
            {(resolvedPlacement === 'bottom' ||
              resolvedPlacement === 'left' ||
              resolvedPlacement === 'right') &&
              dragHandle}
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
            {resolvedPlacement === 'top' ? dragHandle : null}
          </div>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
