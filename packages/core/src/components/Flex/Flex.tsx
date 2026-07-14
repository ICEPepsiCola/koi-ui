import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const flexVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
      rowReverse: 'flex-row-reverse',
      columnReverse: 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      wrapReverse: 'flex-wrap-reverse',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    },
    vertical: {
      true: 'flex-col',
      false: '',
    },
    inline: {
      true: 'inline-flex',
      false: '',
    },
    // CSS 断点适配：窄屏纵向、md+ 横向（与 Stack 一致，不走 JS previewDevice）
    responsive: {
      true: 'flex-col md:flex-row',
      false: '',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    wrap: 'nowrap',
    gap: 0,
    vertical: false,
    inline: false,
    responsive: false,
  },
});

export interface FlexProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  children?: ReactNode;
}

export function Flex({
  direction,
  align,
  justify,
  wrap,
  gap,
  vertical,
  inline,
  responsive = false,
  className,
  children,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        flexVariants({
          // responsive / vertical 时方向由对应变体接管
          direction: responsive || vertical ? undefined : direction,
          align,
          justify,
          wrap,
          gap,
          vertical,
          inline,
          responsive: vertical ? false : responsive,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
