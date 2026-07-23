import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import { StatusIcon, type StatusColor } from '../../utils/semanticSurface';

const noticeBarVariants = tv({
  base: 'flex items-center gap-2 overflow-hidden rounded-box border px-4 py-2 text-sm shadow-none',
  variants: {
    color: {
      primary: 'border-primary/15 bg-primary/10 text-primary',
      info: 'border-info/15 bg-info/10 text-info',
      success: 'border-success/15 bg-success/10 text-success',
      warning: 'border-warning/15 bg-warning/10 text-warning',
      error: 'border-error/15 bg-error/10 text-error',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

export interface NoticeBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'color'>,
    VariantProps<typeof noticeBarVariants> {
  content: ReactNode;
  leftIcon?: ReactNode | null;
  closable?: boolean;
  scrollable?: boolean;
  onClose?: () => void;
}

export function NoticeBar({
  className,
  color = 'primary',
  scrollable,
  content,
  leftIcon,
  closable,
  onClose,
  ...props
}: NoticeBarProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!scrollable || !contentRef.current) return;
    const el = contentRef.current;
    let offset = el.parentElement?.clientWidth ?? 0;
    let raf: number;
    const animate = () => {
      offset -= 1;
      if (offset < -el.scrollWidth) offset = el.parentElement?.clientWidth ?? 0;
      el.style.transform = `translateX(${offset}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [scrollable, content]);

  if (!visible) return null;

  const statusColor: StatusColor | 'neutral' =
    color === 'primary' ? 'info' : (color ?? 'info');
  const resolvedIcon =
    leftIcon === undefined ? (
      <StatusIcon color={statusColor} size="sm" />
    ) : (
      leftIcon
    );

  return (
    <div
      className={cn(noticeBarVariants({ color }), className)}
      role="status"
      {...props}
    >
      {resolvedIcon ? (
        <span className="shrink-0">{resolvedIcon}</span>
      ) : null}
      <div className={cn('min-w-0 flex-1', scrollable && 'overflow-hidden')}>
        <div
          ref={contentRef}
          className={cn(scrollable && 'inline-block whitespace-nowrap')}
        >
          {content}
        </div>
      </div>
      {closable ? (
        <button
          type="button"
          className={cn(
            'inline-flex size-6 shrink-0 items-center justify-center rounded-selector opacity-70',
            'hover:opacity-100',
            controlTransition,
          )}
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
