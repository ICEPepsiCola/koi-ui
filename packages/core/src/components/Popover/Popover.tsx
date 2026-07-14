import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { Portal } from '../../utils/portal';
import {
  clampPortalFixedPosition,
  getPreviewScrollRoot,
  toPortalFixedPosition,
} from '../../utils/toPortalFixedPosition';

const popoverVariants = tv({
  base: 'z-50 rounded-lg border border-border bg-surface p-3 shadow-md',
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

export interface PopoverProps extends VariantProps<typeof popoverVariants> {
  content: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: 'click' | 'hover';
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
  className,
}: PopoverProps) {
  const { portalContainer } = useKoiContext();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [ready, setReady] = useState(false);

  const setOpen = useCallback(
    (v: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(v);
      onOpenChange?.(v);
      if (!v) setReady(false);
    },
    [controlledOpen, onOpenChange],
  );

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportTop =
        placement === 'top' ? rect.top - 8 : rect.bottom + 8;
      const viewportLeft = rect.left + rect.width / 2;
      let next = toPortalFixedPosition(
        viewportTop,
        viewportLeft,
        portalContainer,
      );
      const floating = contentRef.current;
      if (floating) {
        next = clampPortalFixedPosition(
          next,
          floating,
          portalContainer,
          placement === 'top' ? 'bottom-center' : 'top-center',
        );
      }
      setPos(next);
      setReady(true);
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

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, setOpen]);

  const triggerProps =
    trigger === 'hover'
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        }
      : {
          onClick: () => setOpen(!open),
        };

  return (
    <>
      <span ref={triggerRef} className="inline-flex" {...triggerProps}>
        {children}
      </span>
      {open ? (
        <Portal>
          <div
            ref={contentRef}
            className={cn(
              popoverVariants({ placement }),
              'fixed -translate-x-1/2',
              !ready && 'invisible',
              className,
            )}
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {title ? (
              <div className="mb-2 text-sm font-medium text-surface-foreground">
                {title}
              </div>
            ) : null}
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
