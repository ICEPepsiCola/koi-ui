import {
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
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import {
  MOTION_DURATION_S,
  motionTransition,
} from '../../motion/presets';
import { useKoiContext } from '../../provider/context';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';
import {
  getPreviewScrollRoot,
  toPortalFixedPosition,
} from '../../utils/toPortalFixedPosition';

/**
 * Tooltip: daisyUI-inspired color × placement, soft tail arrow,
 * hover / focus-visible / mobile tap, enter-exit motion.
 */
const tooltipVariants = tv({
  base: cn(
    'pointer-events-none relative z-50 max-w-80 whitespace-normal rounded-field px-2 py-1',
    'text-center text-sm leading-tight shadow-float',
    'bg-[var(--koi-tooltip-bg)]',
  ),
  variants: {
    color: {
      // Gap + tail use --koi-tooltip-bg so the arrow always matches the bubble.
      neutral:
        '[--koi-tooltip-bg:var(--color-surface-foreground)] text-surface',
      primary:
        '[--koi-tooltip-bg:var(--color-primary)] text-primary-foreground',
      secondary:
        '[--koi-tooltip-bg:var(--color-secondary)] text-secondary-foreground',
      info: '[--koi-tooltip-bg:var(--color-info)] text-info-foreground',
      success:
        '[--koi-tooltip-bg:var(--color-success)] text-success-foreground',
      warning:
        '[--koi-tooltip-bg:var(--color-warning)] text-warning-foreground',
      error:
        '[--koi-tooltip-bg:var(--color-error)] text-error-foreground',
    },
  },
  defaultVariants: {
    color: 'neutral',
  },
});

/** daisyUI tooltip tail mask (soft triangle). */
const TOOLTIP_TAIL_MASK =
  "url(\"data:image/svg+xml,%3Csvg width='10' height='4' viewBox='0 0 8 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.500009 1C3.5 1 3.00001 4 5.00001 4C7 4 6.5 1 9.5 1C10 1 10 0.499897 10 0H0C-1.99338e-08 0.5 0 1 0.500009 1Z' fill='black'/%3E%3C/svg%3E\")";

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Tip box edge → trigger edge (daisyUI `--tt-off` ≈ 0.5rem). Tail sits in this gap. */
const TIP_GAP = 10;

const arrowClass: Record<TooltipPlacement, string> = {
  // Mask points down by default (daisyUI): top needs no rotate; bottom flips.
  top: 'left-1/2 top-full -translate-x-1/2',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 rotate-180',
  left: 'left-full top-1/2 -translate-y-1/2 -rotate-90',
  right: 'right-full top-1/2 -translate-y-1/2 rotate-90',
};

const motionOffset: Record<
  TooltipPlacement,
  { x?: number; y?: number }
> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

const placementTransform: Record<TooltipPlacement, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};

export interface TooltipProps
  extends Omit<VariantProps<typeof tooltipVariants>, 'color'> {
  content: ReactNode;
  children: ReactNode;
  /**
   * @default 'neutral'
   */
  color?:
    | 'neutral'
    | 'primary'
    | 'secondary'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
  /**
   * @default 'top'
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  color = 'neutral',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: TooltipProps) {
  const { isMobile } = useKoiBreakpoint();
  const { portalContainer } = useKoiContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const reduce = useReducedMotion();

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const offsets = {
        top: { top: rect.top - TIP_GAP, left: rect.left + rect.width / 2 },
        bottom: {
          top: rect.bottom + TIP_GAP,
          left: rect.left + rect.width / 2,
        },
        left: {
          top: rect.top + rect.height / 2,
          left: rect.left - TIP_GAP,
        },
        right: {
          top: rect.top + rect.height / 2,
          left: rect.right + TIP_GAP,
        },
      };
      const point = offsets[placement];
      // Do not clamp into the viewport — near the top of docs preview that
      // would shove the tip down onto the trigger (daisyUI just overflows).
      setPos(toPortalFixedPosition(point.top, point.left, portalContainer));
    };

    update();
    // Re-measure after paint so transformTemplate / content size settle.
    const raf = requestAnimationFrame(update);

    const scrollRoot = getPreviewScrollRoot(portalContainer);
    scrollRoot?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      scrollRoot?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open, placement, portalContainer, content]);

  const offset = motionOffset[placement];
  const duration = reduce ? 0 : MOTION_DURATION_S;

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
        onFocus={(event) => {
          if (isMobile) return;
          const target = event.target as HTMLElement;
          if (target.matches?.(':focus-visible')) setOpen(true);
        }}
        onBlur={(event) => {
          if (isMobile) return;
          const next = event.relatedTarget as Node | null;
          if (!event.currentTarget.contains(next)) setOpen(false);
        }}
        onClick={() => isMobile && setOpen(!open)}
      >
        {children}
      </span>
      <Portal>
        <AnimatePresence>
          {open ? (
            <motion.div
              key="koi-tooltip"
              ref={contentRef}
              role="tooltip"
              className={cn(
                tooltipVariants({ color }),
                'fixed w-max',
                className,
              )}
              style={{
                top: pos.top,
                left: pos.left,
              }}
              initial={{ opacity: 0, ...offset }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{
                opacity: 0,
                ...offset,
                transition: {
                  ...motionTransition,
                  duration,
                  delay: reduce ? 0 : 0.075,
                },
              }}
              transition={{ ...motionTransition, duration }}
              transformTemplate={(_t, generated) =>
                `${placementTransform[placement]} ${generated}`
              }
            >
              {content}
              <span
                aria-hidden
                className={cn(
                  'absolute block h-1 w-2.5 bg-[var(--koi-tooltip-bg)]',
                  arrowClass[placement],
                )}
                style={{
                  maskImage: TOOLTIP_TAIL_MASK,
                  WebkitMaskImage: TOOLTIP_TAIL_MASK,
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: '-1px 0',
                  WebkitMaskPosition: '-1px 0',
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}
