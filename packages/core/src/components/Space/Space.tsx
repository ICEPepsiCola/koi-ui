import { Children, Fragment, type HTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const spaceVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    size: {
      small: 'gap-2',
      middle: 'gap-4',
      large: 'gap-6',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    direction: 'horizontal',
    size: 'small',
    align: 'center',
    wrap: false,
  },
});

export interface SpaceProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spaceVariants> {
  children?: ReactNode;
  split?: ReactNode;
}

export function Space({
  direction,
  size,
  align,
  wrap,
  split,
  className,
  children,
  ...props
}: SpaceProps) {
  const items = Children.toArray(children).filter((child) => child != null && child !== '');

  return (
    <div
      className={cn(spaceVariants({ direction, size, align, wrap }), className)}
      {...props}
    >
      {items.map((child, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={index}>
            {child}
            {!isLast && split ? (
              <span className="text-muted-foreground" aria-hidden>
                {split}
              </span>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
