import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import {
  MOTION_DURATION_S,
  motionTransition,
} from '../../motion/presets';
import { floatPanel } from '../../utils/interaction';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import {
  clampPortalFixedPosition,
  getPreviewScrollRoot,
  toPortalFixedPosition,
  type PortalFixedAnchor,
} from '../../utils/toPortalFixedPosition';

type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

const popoverVariants = tv({
  base: cn('z-[200] max-w-xs p-3', floatPanel),
  variants: {
    placement: {
      top: '',
      bottom: '',
      left: '',
      right: '',
    },
  },
  defaultVariants: {
    placement: 'bottom',
  },
});

const GAP = 10;

const placementTransform: Record<PopoverPlacement, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};

const motionOffset: Record<PopoverPlacement, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

/** `pos` anchor after CSS translate — for clamping inside the preview portal. */
const clampAnchor: Record<PopoverPlacement, PortalFixedAnchor> = {
  top: 'bottom-center',
  bottom: 'top-center',
  left: 'right-center',
  right: 'left-center',
};

export interface PopoverProps
  extends Omit<VariantProps<typeof popoverVariants>, 'placement'> {
  content: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  /**
   * @default 'bottom'
   */
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: 'click' | 'hover';
  /** @default true — click trigger only */
  closeOnEscape?: boolean;
  className?: string;
}

export function Popover({
  content,
  children,
  title,
  placement = 'bottom',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  trigger = 'click',
  closeOnEscape = true,
  className,
}: PopoverProps) {
  const { portalContainer } = useKoiContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();
  const titleId = useId();
  const isClickTrigger = trigger === 'click';
  const layerOpen = open && isClickTrigger;

  const setOpen = useCallback(
    (v: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [controlledOpen, onOpenChange],
  );

  useDismissibleLayer({
    open: layerOpen,
    onDismiss: () => setOpen(false),
    containerRef: contentRef,
    excludeRef: triggerRef,
    closeOnEscape,
    closeOnPointerDownOutside: true,
  });

  useFocusTrap({
    active: layerOpen,
    containerRef: contentRef,
    restoreFocus: true,
  });

  useEffect(() => {
    if (!open) setReady(false);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const point = {
        top: {
          top: rect.top - GAP,
          left: rect.left + rect.width / 2,
        },
        bottom: {
          top: rect.bottom + GAP,
          left: rect.left + rect.width / 2,
        },
        left: {
          top: rect.top + rect.height / 2,
          left: rect.left - GAP,
        },
        right: {
          top: rect.top + rect.height / 2,
          left: rect.right + GAP,
        },
      }[placement];

      let next = toPortalFixedPosition(point.top, point.left, portalContainer);
      const floating = contentRef.current;
      if (floating) {
        next = clampPortalFixedPosition(
          next,
          floating,
          portalContainer,
          clampAnchor[placement],
        );
      }
      setPos(next);
      setReady(true);
    };

    update();
    const raf = requestAnimationFrame(update);

    const scrollRoot = getPreviewScrollRoot(portalContainer);
    scrollRoot?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      scrollRoot?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open, placement, portalContainer, content, title]);

  const triggerProps =
    trigger === 'hover'
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        }
      : {
          onClick: () => setOpen(!open),
        };

  const offset = motionOffset[placement];
  const duration = reduce ? 0 : MOTION_DURATION_S;

  return (
    <>
      <span ref={triggerRef} className="inline-flex" {...triggerProps}>
        {children}
      </span>
      <Portal>
        <AnimatePresence>
          {open ? (
            <motion.div
              key="koi-popover"
              ref={contentRef}
              role="dialog"
              aria-modal={isClickTrigger || undefined}
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              className={cn(
                popoverVariants({ placement }),
                'fixed w-max outline-none',
                className,
              )}
              style={{
                top: pos.top,
                left: pos.left,
                visibility: ready ? 'visible' : 'hidden',
              }}
              initial={{ opacity: 0, ...offset }}
              animate={{ opacity: ready ? 1 : 0, x: 0, y: 0 }}
              exit={{
                opacity: 0,
                ...offset,
                transition: {
                  ...motionTransition,
                  duration,
                  delay: reduce ? 0 : 0.05,
                },
              }}
              transition={{ ...motionTransition, duration }}
              transformTemplate={(_t, generated) =>
                `${placementTransform[placement]} ${generated}`
              }
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={
                trigger === 'hover' ? () => setOpen(true) : undefined
              }
              onMouseLeave={
                trigger === 'hover' ? () => setOpen(false) : undefined
              }
            >
              {title ? (
                <div
                  id={titleId}
                  className="mb-2 text-sm font-semibold text-surface-foreground"
                >
                  {title}
                </div>
              ) : null}
              {content}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}
