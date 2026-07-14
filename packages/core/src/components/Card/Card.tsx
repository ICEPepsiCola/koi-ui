import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const card = tv({
  base: 'rounded-lg border border-border bg-surface shadow-sm',
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    hoverable: {
      true: 'transition-shadow hover:shadow-md cursor-pointer',
      false: '',
    },
  },
  defaultVariants: {
    padding: 'md',
    hoverable: false,
  },
});

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof card> {
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Card({
  className,
  padding,
  hoverable,
  title,
  footer,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(card({ padding, hoverable }), className)} {...props}>
      {title ? (
        <div className="mb-3 text-base font-semibold text-surface-foreground">
          {title}
        </div>
      ) : null}
      <div>{children}</div>
      {footer ? (
        <div className="mt-4 border-t border-border pt-3">{footer}</div>
      ) : null}
    </div>
  );
}
