import type { HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const progressVariants = tv({
  base: 'w-full overflow-hidden rounded-full bg-muted',
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
    variant: {
      default: '',
      success: '',
      warning: '',
      destructive: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

const barColors = {
  default: 'bg-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-destructive',
} as const;

export interface ProgressProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  percent?: number;
  showInfo?: boolean;
  strokeColor?: string;
}

export function Progress({
  className,
  size,
  variant,
  percent = 0,
  showInfo = false,
  strokeColor,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(progressVariants({ size, variant }))}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            !strokeColor && barColors[variant ?? 'default'],
          )}
          style={{
            width: `${clamped}%`,
            backgroundColor: strokeColor,
          }}
        />
      </div>
      {showInfo ? (
        <span className="shrink-0 text-xs text-muted-foreground">
          {clamped}%
        </span>
      ) : null}
    </div>
  );
}
