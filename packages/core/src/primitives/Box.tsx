import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils/cn';

const box = tv({
  base: '',
  variants: {
    p: {
      0: 'p-0',
      2: 'p-2',
      4: 'p-4',
      6: 'p-6',
      8: 'p-8',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
    },
    bg: {
      surface: 'bg-surface',
      muted: 'bg-muted',
      primary: 'bg-primary',
    },
    border: {
      true: 'border border-border',
      false: '',
    },
  },
  defaultVariants: {
    p: 4,
    rounded: 'md',
    bg: 'surface',
    border: false,
  },
});

export interface BoxProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof box> {
  children?: ReactNode;
}

export function Box({
  className,
  p,
  rounded,
  bg,
  border,
  children,
  ...props
}: BoxProps) {
  return (
    <div className={cn(box({ p, rounded, bg, border }), className)} {...props}>
      {children}
    </div>
  );
}
