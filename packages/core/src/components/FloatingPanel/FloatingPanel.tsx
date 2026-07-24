import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useScrollLock } from '../../hooks/useScrollLock';
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
   * Drag below half of the lowest anchor to close.
   * @default true
   * @since 1.12.0
   */
  closeOnDrag?: boolean;
}

function resolveViewportHeight(
  portalContainer: HTMLElement | null | undefined,
): number {
  const root = getPortalFixedRoot(portalContainer);
  if (root && root.clientHeight > 0) return root.clientHeight;
  return typeof window !== 'undefined' ? window.innerHeight : 400;
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

  const snapToAnchor = useCallback(
    (h: number) => {
      const vh = resolveViewportHeight(portalContainer);
      const ratios = anchorsRef.current.map((a) => a * vh);
      const lowest = Math.min(...ratios);
      if (closeOnDragRef.current && h < lowest * 0.5) {
        onCloseRef.current?.();
        return;
      }
      const closest = ratios.reduce((prev, curr) =>
        Math.abs(curr - h) < Math.abs(prev - h) ? curr : prev,
      );
      setHeight(closest);
    },
    [portalContainer, setHeight],
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
    dragging.current = true;
    dragMoved.current = false;
    activePointerId.current = e.pointerId;
    startY.current = e.clientY;
    startHeight.current = heightRef.current;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || activePointerId.current !== e.pointerId) return;
    const diff = startY.current - e.clientY;
    if (Math.abs(diff) > 4) dragMoved.current = true;
    setHeight(Math.max(0, startHeight.current + diff));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || activePointerId.current !== e.pointerId) return;
    const moved = dragMoved.current;
    dragging.current = false;
    activePointerId.current = null;
    dragMoved.current = false;
    if (moved) snapToAnchor(heightRef.current);
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
    if (moved) snapToAnchor(heightRef.current);
  };

  const stopPanelClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const panelClassName = cn(
    'flex w-full flex-col rounded-t-box border border-border/80 bg-surface shadow-overlay',
    className,
  );

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
