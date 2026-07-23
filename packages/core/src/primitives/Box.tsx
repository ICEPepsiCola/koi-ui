import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils/cn';
import { toSpacingValue } from '../utils/spacing';

const box = tv({
  base: '',
  variants: {
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
    rounded: 'md',
    bg: 'surface',
    border: false,
  },
});

export interface BoxProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof box> {
  children?: ReactNode;
  /**
   * Padding. Numbers use the Tailwind spacing scale
   * (`3` → `p-3` equivalent). Strings are raw CSS lengths.
   * @default 4
   */
  p?: number | string;
}

export function Box({
  className,
  p = 4,
  rounded,
  bg,
  border,
  style,
  children,
  ...props
}: BoxProps) {
  return (
    <div
      className={cn(box({ rounded, bg, border }), className)}
      style={{ ...style, padding: toSpacingValue(p) }}
      {...props}
    >
      {children}
    </div>
  );
}
