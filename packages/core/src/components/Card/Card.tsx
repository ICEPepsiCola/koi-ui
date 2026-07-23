import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { isActivationKey } from '../../utils/keyboard';

const card = tv({
  base: 'flex flex-col overflow-hidden rounded-box border border-border/80 bg-surface shadow-field',
  variants: {
    padding: {
      none: '',
      sm: '',
      md: '',
      lg: '',
    },
    hoverable: {
      true: 'cursor-pointer transition-[box-shadow,transform] duration-fast ease-emphasized hover:shadow-float active:scale-[0.995] motion-reduce:transition-none motion-reduce:active:scale-100',
      false: '',
    },
  },
  defaultVariants: {
    padding: 'md',
    hoverable: false,
  },
});

const bodyPad: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof card> {
  title?: ReactNode;
  /** Image / media region (daisyUI figure). */
  cover?: ReactNode;
  footer?: ReactNode;
  /** Action row (buttons), daisyUI card-actions. */
  actions?: ReactNode;
  children?: ReactNode;
}

export function Card({
  className,
  padding = 'md',
  hoverable,
  title,
  cover,
  footer,
  actions,
  children,
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...props
}: CardProps) {
  const interactive = typeof onClick === 'function';
  const pad = bodyPad[padding ?? 'md'];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive || !isActivationKey(event.key)) return;
    event.preventDefault();
    onClick?.(event as unknown as ReactMouseEvent<HTMLDivElement>);
  };

  return (
    <div
      className={cn(card({ padding, hoverable }), className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role ?? (interactive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      {...props}
    >
      {cover ? (
        <div className="shrink-0 overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
          {cover}
        </div>
      ) : null}
      <div className={cn('flex min-h-0 flex-1 flex-col', pad)}>
        {title ? (
          <div className="mb-2 text-base font-semibold text-surface-foreground">
            {title}
          </div>
        ) : null}
        {children ? <div className="min-w-0 flex-1 text-sm">{children}</div> : null}
        {actions ? (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        ) : null}
        {footer ? (
          <div
            className={cn(
              'mt-4 border-t border-border pt-3',
              actions && 'mt-3',
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
