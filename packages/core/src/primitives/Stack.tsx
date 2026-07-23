import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils/cn';
import { toSpacingValue } from '../utils/spacing';

const stack = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    responsive: {
      true: 'flex-col md:flex-row',
      false: '',
    },
  },
  defaultVariants: {
    direction: 'col',
    align: 'stretch',
    justify: 'start',
    responsive: false,
  },
});

export interface StackProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stack> {
  children?: ReactNode;
  /**
   * Gap between items. Numbers use the Tailwind spacing scale
   * (`3` → `gap-3` equivalent). Strings are raw CSS lengths.
   * @default 4
   */
  gap?: number | string;
}

export function Stack({
  className,
  direction,
  gap = 4,
  align,
  justify,
  responsive,
  style,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(stack({ direction, align, justify, responsive }), className)}
      style={{ ...style, gap: toSpacingValue(gap) }}
      {...props}
    >
      {children}
    </div>
  );
}
