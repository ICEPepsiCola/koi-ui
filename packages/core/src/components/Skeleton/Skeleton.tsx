import type { HTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const skeletonVariants = tv({
  base: 'animate-pulse rounded-md bg-muted',
  variants: {
    variant: {
      text: 'h-4 w-full',
      circular: 'rounded-full',
      rectangular: '',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: number | string;
  height?: number | string;
  active?: boolean;
}

export function Skeleton({
  className,
  variant,
  width,
  height,
  active = true,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        skeletonVariants({ variant }),
        !active && 'animate-none',
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden
      {...props}
    />
  );
}

export interface SkeletonGroupProps {
  rows?: number;
  avatar?: boolean;
  className?: string;
}

export function SkeletonGroup({
  rows = 3,
  avatar = false,
  className,
}: SkeletonGroupProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      {avatar ? <Skeleton variant="circular" width={40} height={40} /> : null}
      <div className="flex-1 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={i === rows - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  );
}
