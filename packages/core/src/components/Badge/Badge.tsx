import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { semanticSurfaceCompounds } from '../../utils/semanticSurface';

/**
 * Badge: daisyUI-aligned color × variant
 * (soft / outline / dash / solid / ghost), plus count / dot overlay.
 */
const badgeVariants = tv({
  base: 'inline-flex items-center justify-center border font-medium',
  variants: {
    color: {
      neutral: '',
      primary: '',
      secondary: '',
      info: '',
      success: '',
      warning: '',
      error: '',
    },
    variant: {
      soft: '',
      outline: '',
      dash: '',
      solid: '',
      ghost: '',
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
  compoundVariants: semanticSurfaceCompounds(),
  defaultVariants: {
    color: 'error',
    variant: 'solid',
    size: 'md',
    dot: false,
  },
});

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  count?: number;
  max?: number;
  showZero?: boolean;
  children?: ReactNode;
}

export function Badge({
  className,
  color,
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
      className={cn(badgeVariants({ color, variant, size, dot }), className)}
      {...props}
    >
      {!dot && displayCount}
    </span>
  );

  if (!children) return badge;

  return (
    <span className="relative inline-flex">
      {children}
      <span className="pointer-events-none absolute right-0 top-0 z-10 translate-x-1/2 -translate-y-1/2">
        {badge}
      </span>
    </span>
  );
}
