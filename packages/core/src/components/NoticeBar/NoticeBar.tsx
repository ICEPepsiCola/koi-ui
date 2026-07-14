import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const noticeBarVariants = tv({
  base: 'flex items-center gap-2 overflow-hidden px-4 py-2 text-sm',
  variants: {
    variant: {
      default: 'bg-primary/10 text-primary',
      warning: 'bg-amber-50 text-amber-700',
      error: 'bg-destructive/10 text-destructive',
    },
    scrollable: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    scrollable: false,
  },
});

export interface NoticeBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'>,
    VariantProps<typeof noticeBarVariants> {
  content: ReactNode;
  leftIcon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

export function NoticeBar({
  className,
  variant,
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

  return (
    <div
      className={cn(noticeBarVariants({ variant, scrollable }), className)}
      role="status"
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
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
          className="shrink-0 rounded-sm p-0.5 hover:opacity-70"
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
