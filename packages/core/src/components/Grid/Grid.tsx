import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const rowVariants = tv({
  base: 'flex flex-wrap',
  variants: {
    gutter: {
      none: '',
      sm: '-mx-1',
      md: '-mx-2',
      lg: '-mx-3',
    },
    align: {
      top: 'items-start',
      middle: 'items-center',
      bottom: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
  },
  defaultVariants: {
    gutter: 'md',
    align: 'top',
    justify: 'start',
  },
});

const colVariants = tv({
  base: 'min-w-0',
  variants: {
    gutter: {
      none: '',
      sm: 'px-1',
      md: 'px-2',
      lg: 'px-3',
    },
  },
  defaultVariants: {
    gutter: 'md',
  },
});

function spanClass(span: number): string {
  if (span <= 0 || span > 24) return 'w-full';
  return `w-[calc(100%*${span}/24)]`;
}

export interface RowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    Omit<VariantProps<typeof rowVariants>, 'gutter'> {
  children?: ReactNode;
  gutter?: 'none' | 'sm' | 'md' | 'lg' | [number, number];
}

export function Row({
  gutter = 'md',
  align,
  justify,
  className,
  children,
  style,
  ...props
}: RowProps) {
  const gutterKey = Array.isArray(gutter) ? 'md' : gutter;
  const [gutterX, gutterY] = Array.isArray(gutter) ? gutter : [undefined, undefined];

  return (
    <div
      className={cn(rowVariants({ gutter: gutterKey, align, justify }), className)}
      style={{
        ...style,
        ...(gutterX !== undefined
          ? { marginLeft: -gutterX / 2, marginRight: -gutterX / 2 }
          : {}),
        ...(gutterY !== undefined ? { rowGap: gutterY } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  span?: number;
  offset?: number;
  children?: ReactNode;
  gutter?: 'none' | 'sm' | 'md' | 'lg' | [number, number];
}

export function Col({
  span = 24,
  offset = 0,
  gutter = 'md',
  className,
  children,
  style,
  ...props
}: ColProps) {
  const gutterKey = Array.isArray(gutter) ? 'md' : gutter;
  const [gutterX] = Array.isArray(gutter) ? gutter : [undefined];

  return (
    <div
      className={cn(
        colVariants({ gutter: gutterKey }),
        spanClass(span),
        offset > 0 && `ml-[calc(100%*${offset}/24)]`,
        className,
      )}
      style={{
        ...style,
        ...(gutterX !== undefined ? { paddingLeft: gutterX / 2, paddingRight: gutterX / 2 } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export const Grid = {
  Row,
  Col,
};
