import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const badgeVariants = tv({
  base: 'inline-flex items-center justify-center font-medium',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      soft: 'bg-primary/15 text-primary',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-border text-surface-foreground',
      ghost: 'bg-transparent text-muted-foreground',
    },
    size: {
      sm: 'h-4 min-w-4 px-1 text-[10px] rounded-full',
      md: 'h-5 min-w-5 px-1.5 text-xs rounded-full',
      lg: 'h-6 min-w-6 px-2 text-sm rounded-full',
    },
    dot: {
      true: 'h-2 w-2 min-w-2 p-0 rounded-full',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    dot: false,
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  count?: number;
  max?: number;
  showZero?: boolean;
  children?: ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  count,
  max = 99,
  showZero = false,
  children,
  ...props
}: BadgeProps) {
  const displayCount =
    count !== undefined
      ? count > max
        ? `${max}+`
        : String(count)
      : null;

  const hidden =
    count !== undefined && !showZero && count === 0 && !dot;

  if (hidden) return <>{children}</>;

  const badge = (
    <span
      className={cn(badgeVariants({ variant, size, dot }), className)}
      {...props}
    >
      {!dot && displayCount}
    </span>
  );

  if (!children) return badge;

  return (
    <span className="relative inline-flex">
      {children}
      <span className="absolute -right-1 -top-1">{badge}</span>
    </span>
  );
}
