import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { animate, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useScrollLock } from '../../hooks/useScrollLock';
import {
  nearestAnchor,
  shouldDismiss,
  velocityFromSamples,
  type PointSample,
} from '../../motion/gesture';
import { project, rubberband } from '../../motion/physics';
import { springMomentum } from '../../motion/presets';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import { getPortalFixedRoot } from '../../utils/toPortalFixedPosition';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';

export interface FloatingPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  anchors?: number[];
  defaultAnchor?: number;
  showOverlay?: boolean;
  /**
   * Click the overlay (or outside the panel when `showOverlay={false}`) to close.
   * @default true
   * @since 1.12.0
   */
  maskClosable?: boolean;
  /**
   * Press Escape to close.
   * @default true
   * @since 1.12.0
   */
  closeOnEscape?: boolean;
  /**
   * Drag down to a projected closed endpoint to close.
   * @breaking The release projection and downward velocity now determine dismissal.
   * @default true
   * @since 1.12.0
   */
  closeOnDrag?: boolean;
}

const VELOCITY_SAMPLES_MAX = 20;
const VELOCITY_SAMPLES_WINDOW_MS = 200;

function resolveViewportHeight(
  portalContainer: HTMLElement | null | undefined,
): number {
  const root = getPortalFixedRoot(portalContainer);
  if (root && root.clientHeight > 0) return root.clientHeight;
  return typeof window !== 'undefined' ? window.innerHeight : 400;
}

export function shouldDismissFloatingPanel({
  projectedHeight,
  gestureVelocity,
}: {
  projectedHeight: number;
  gestureVelocity: number;
}): boolean {
  return (
    gestureVelocity > 0 &&
    projectedHeight <= 0 &&
    shouldDismiss({
      velocity: 0,
      offset: -projectedHeight,
      dismissOffset: 0,
      dismissVelocity: Number.POSITIVE_INFINITY,
    })
  );
}

/**
 * 底部浮动面板：按锚点比例吸附高度。
 * 在文档预览里以 portal 根高度为基准；Pointer Events 支持触控与鼠标拖拽。
 */
export function FloatingPanel({
  className,
  open = true,
  onClose,
  title,
  children,
  anchors = [0.4, 0.7],
  defaultAnchor = 0.4,
  showOverlay = true,
  maskClosable = true,
  closeOnEscape = true,
  closeOnDrag = true,
  onDrag: _onDrag,
  onDragStart: _onDragStart,
  onDragEnd: _onDragEnd,
  onAnimationStart: _onAnimationStart,
  onAnimationEnd: _onAnimationEnd,
  onAnimationIteration: _onAnimationIteration,
  ...props
}: FloatingPanelProps) {
  const { portalContainer } = useKoiContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeightState] = useState<number | null>(null);
  const heightRef = useRef(0);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const dragging = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const samples = useRef<PointSample[]>([]);
  const spring = useRef<{ stop: () => void } | null>(null);
  const anchorsRef = useRef(anchors);
  const onCloseRef = useRef(onClose);
  const defaultAnchorRef = useRef(defaultAnchor);
  const closeOnDragRef = useRef(closeOnDrag);

  useEffect(() => {
    anchorsRef.current = anchors;
    onCloseRef.current = onClose;
    defaultAnchorRef.current = defaultAnchor;
    closeOnDragRef.current = closeOnDrag;
  }, [anchors, onClose, defaultAnchor, closeOnDrag]);

  const handleDismiss = useCallback(() => {
    onCloseRef.current?.();
  }, []);

  useDismissibleLayer({
    open,
    onDismiss: handleDismiss,
    containerRef: panelRef,
    closeOnEscape,
    // No scrim — outside click plays the same role as overlay click.
    closeOnPointerDownOutside: !showOverlay && maskClosable,
  });

  const setHeight = useCallback((next: number) => {
    heightRef.current = next;
    setHeightState((prev) => (prev === next ? prev : next));
  }, []);

  const stopSpring = useCallback(() => {
    spring.current?.stop();
    spring.current = null;
  }, []);

  const snapToAnchor = useCallback(
    (currentHeight: number, gestureVelocity = 0) => {
      const viewportHeight = resolveViewportHeight(portalContainer);
      const anchorHeights = anchorsRef.current.map(
        (anchor) => anchor * viewportHeight,
      );
      const minAnchor = Math.min(...anchorHeights);
      const maxAnchor = Math.max(...anchorHeights);
      // Pointer Y grows downward, while panel height grows upward.
      const projectedHeight = currentHeight - project(gestureVelocity);

      if (
        closeOnDragRef.current &&
        shouldDismissFloatingPanel({ projectedHeight, gestureVelocity })
      ) {
        onCloseRef.current?.();
        return;
      }

      const target = nearestAnchor(
        Math.min(maxAnchor, Math.max(minAnchor, projectedHeight)),
        anchorHeights,
      );
      stopSpring();
      spring.current = animate(currentHeight, target, {
        ...springMomentum,
        velocity: -gestureVelocity,
        onUpdate: setHeight,
        onComplete: () => {
          spring.current = null;
        },
      });
    },
    [portalContainer, setHeight, stopSpring],
  );

  useEffect(() => {
    if (!open) return;

    const applyDefault = () => {
      const vh = resolveViewportHeight(portalContainer);
      setHeight(vh * defaultAnchorRef.current);
    };
    applyDefault();

    const root = getPortalFixedRoot(portalContainer);
    if (root && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        // 视口尺寸变化时按当前高度重新吸附，避免溢出预览框
        if (heightRef.current > 0) {
          snapToAnchor(heightRef.current);
        } else {
          applyDefault();
        }
      });
      ro.observe(root);
      return () => ro.disconnect();
    }

    const onResize = () => {
      if (heightRef.current > 0) {
        snapToAnchor(heightRef.current);
      } else {
        applyDefault();
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, portalContainer, setHeight, snapToAnchor]);

  useScrollLock(open && showOverlay);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    stopSpring();
    dragging.current = true;
    dragMoved.current = false;
    activePointerId.current = e.pointerId;
    startY.current = e.clientY;
    startHeight.current = heightRef.current;
    samples.current = [{ y: e.clientY, t: performance.now() }];
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || activePointerId.current !== e.pointerId) return;
    const diff = startY.current - e.clientY;
    if (Math.abs(diff) > 4) dragMoved.current = true;
    const viewportHeight = resolveViewportHeight(portalContainer);
    const anchorHeights = anchorsRef.current.map(
      (anchor) => anchor * viewportHeight,
    );
    const minAnchor = Math.min(...anchorHeights);
    const maxAnchor = Math.max(...anchorHeights);
    const rawHeight = startHeight.current + diff;
    const nextHeight =
      rawHeight > maxAnchor
        ? maxAnchor + rubberband(rawHeight - maxAnchor, viewportHeight)
        : rawHeight < minAnchor
          ? minAnchor - rubberband(minAnchor - rawHeight, viewportHeight)
          : rawHeight;

    setHeight(nextHeight);
    const now = performance.now();
    samples.current.push({ y: e.clientY, t: now });
    const cutoff = now - VELOCITY_SAMPLES_WINDOW_MS;
    while (
      samples.current.length > VELOCITY_SAMPLES_MAX ||
      (samples.current.length > 2 && samples.current[0].t < cutoff)
    ) {
      samples.current.shift();
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || activePointerId.current !== e.pointerId) return;
    const moved = dragMoved.current;
    dragging.current = false;
    activePointerId.current = null;
    dragMoved.current = false;
    const gestureVelocity = velocityFromSamples(samples.current);
    samples.current = [];
    if (moved) snapToAnchor(heightRef.current, gestureVelocity);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || activePointerId.current !== e.pointerId) return;
    const moved = dragMoved.current;
    dragging.current = false;
    activePointerId.current = null;
    dragMoved.current = false;
    samples.current = [];
    if (moved) snapToAnchor(heightRef.current);
  };

  const stopPanelClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const panelClassName = cn(
    // Layout only — sheetSurface (MotionPanel bottom) owns radius / material / shadow.
    'flex w-full flex-col',
    className,
  );
  const viewportHeight = resolveViewportHeight(portalContainer);
  const minAnchor = Math.min(
    ...anchors.map((anchor) => anchor * viewportHeight),
  );
  // Only override Overlay variants while the panel is below the lowest anchor
  // (drag / rubberband dismiss). At rest, leave opacity to enter/exit fades.
  const dragLinkedScrim =
    height !== null && height < minAnchor
      ? Math.min(1, Math.max(0, height / minAnchor))
      : undefined;

  const panelBody = (
    <>
      <div
        className="flex touch-none cursor-grab flex-col items-center py-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={onPointerCancel}
      >
        <div className="h-1 w-10 rounded-full bg-border" />
      </div>
      {title ? (
        <div className="border-b border-border/80 px-4 py-2 text-center text-sm font-medium">
          {title}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">{children}</div>
    </>
  );

  if (!showOverlay) {
    return (
      <Portal>
        <AnimatePresence>
          {open ? (
            <MotionPanel
              ref={panelRef}
              variant="bottom"
              initial="closed"
              animate="open"
              exit="closed"
              className={cn(panelClassName, 'fixed bottom-0 left-0 right-0 z-50')}
              style={{ height: height ?? undefined }}
              {...props}
              onClick={stopPanelClick}
            >
              {panelBody}
            </MotionPanel>
          ) : null}
        </AnimatePresence>
      </Portal>
    );
  }

  return (
    <Portal>
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className="flex items-end"
        style={
          dragLinkedScrim === undefined
            ? undefined
            : { opacity: dragLinkedScrim }
        }
      >
        <MotionPanel
          ref={panelRef}
          variant="bottom"
          className={panelClassName}
          style={{ height: height ?? undefined }}
          {...props}
          onClick={stopPanelClick}
        >
          {panelBody}
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
