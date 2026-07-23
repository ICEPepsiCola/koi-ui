import type { HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import {
  progressBarClass,
  type ProgressColor,
} from '../../utils/semanticSurface';

const progressVariants = tv({
  base: 'w-full overflow-hidden rounded-full bg-muted',
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressVariants> {
  percent?: number;
  showInfo?: boolean;
  strokeColor?: string;
  /** @default 'primary' */
  color?: ProgressColor;
}

export function Progress({
  className,
  size,
  color = 'primary',
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
        className={cn(progressVariants({ size }))}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            !strokeColor && progressBarClass(color),
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
