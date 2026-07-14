import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Spinner } from '../shared/Spinner';

const spinVariants = tv({
  base: 'relative inline-flex',
  variants: {
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const spinnerSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
} as const;

export interface SpinProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinVariants> {
  spinning?: boolean;
  tip?: ReactNode;
  children?: ReactNode;
}

export function Spin({
  className,
  size = 'md',
  spinning = true,
  tip,
  children,
  ...props
}: SpinProps) {
  if (!children) {
    return spinning ? (
      <div className={cn('inline-flex flex-col items-center gap-2', className)} {...props}>
        <Spinner className={spinnerSizes[size ?? 'md']} />
        {tip ? <span className="text-xs text-muted-foreground">{tip}</span> : null}
      </div>
    ) : null;
  }

  return (
    <div className={cn(spinVariants({ size }), className)} {...props}>
      {children}
      {spinning ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/60">
          <Spinner className={spinnerSizes[size ?? 'md']} />
          {tip ? (
            <span className="mt-2 text-xs text-muted-foreground">{tip}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
