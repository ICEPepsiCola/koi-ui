import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const statisticVariants = tv({
  base: 'flex flex-col',
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

const valueSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
} as const;

export interface StatisticProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix' | 'suffix'>,
    VariantProps<typeof statisticVariants> {
  title?: ReactNode;
  value?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  precision?: number;
}

export function Statistic({
  className,
  size = 'md',
  title,
  value,
  prefix,
  suffix,
  precision,
  ...props
}: StatisticProps) {
  let displayValue = value;
  if (typeof value === 'number' && precision !== undefined) {
    displayValue = value.toFixed(precision);
  }

  return (
    <div className={cn(statisticVariants({ size }), className)} {...props}>
      {title ? (
        <div className="mb-1 text-sm text-muted-foreground">{title}</div>
      ) : null}
      <div
        className={cn(
          'flex items-baseline gap-1 font-semibold text-surface-foreground',
          valueSizes[size ?? 'md'],
        )}
      >
        {prefix ? (
          <span className="text-base font-normal text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <span>{displayValue}</span>
        {suffix ? (
          <span className="text-base font-normal text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
