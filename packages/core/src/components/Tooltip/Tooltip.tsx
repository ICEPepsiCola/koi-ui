import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { useKoiContext } from '../../provider/context';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';
import {
  clampPortalFixedPosition,
  getPreviewScrollRoot,
  toPortalFixedPosition,
} from '../../utils/toPortalFixedPosition';

const tooltipVariants = tv({
  base: 'z-50 rounded-md px-2 py-1 text-xs shadow-md',
  variants: {
    variant: {
      default: 'bg-surface-foreground text-surface',
      light: 'bg-surface border border-border text-surface-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  open?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  variant,
  open: controlledOpen,
  defaultOpen = false,
  className,
}: TooltipProps) {
  const { isMobile } = useKoiBreakpoint();
  const { portalContainer } = useKoiContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const anchor =
      placement === 'bottom'
        ? 'top-center'
        : placement === 'left'
          ? 'left-center'
          : placement === 'right'
            ? 'right-center'
            : 'bottom-center';

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const offsets = {
        top: { top: rect.top - 8, left: rect.left + rect.width / 2 },
        bottom: { top: rect.bottom + 8, left: rect.left + rect.width / 2 },
        left: { top: rect.top + rect.height / 2, left: rect.left - 8 },
        right: { top: rect.top + rect.height / 2, left: rect.right + 8 },
      };
      const point = offsets[placement];
      let next = toPortalFixedPosition(
        point.top,
        point.left,
        portalContainer,
      );
      const floating = contentRef.current;
      if (floating) {
        next = clampPortalFixedPosition(
          next,
          floating,
          portalContainer,
          anchor,
        );
      }
      setPos(next);
    };

    update();

    const scrollRoot = getPreviewScrollRoot(portalContainer);
    scrollRoot?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scrollRoot?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open, placement, portalContainer]);

  const show = (v: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(v);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={() => !isMobile && show(true)}
        onMouseLeave={() => !isMobile && show(false)}
        onClick={() => isMobile && show(!open)}
      >
        {children}
      </span>
      {open ? (
        <Portal>
          <div
            ref={contentRef}
            role="tooltip"
            className={cn(tooltipVariants({ variant }), 'fixed', className)}
            style={{
              top: pos.top,
              left: pos.left,
              transform:
                placement === 'bottom'
                  ? 'translate(-50%, 0)'
                  : placement === 'left'
                    ? 'translate(-100%, -50%)'
                    : placement === 'right'
                      ? 'translate(0, -50%)'
                      : 'translate(-50%, -100%)',
            }}
          >
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
