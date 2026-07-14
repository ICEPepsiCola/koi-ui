import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils/cn';

const stack = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
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
    gap: 4,
    align: 'stretch',
    justify: 'start',
    responsive: false,
  },
});

export interface StackProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stack> {
  children?: ReactNode;
}

export function Stack({
  className,
  direction,
  gap,
  align,
  justify,
  responsive,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        stack({ direction, gap, align, justify, responsive }),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
