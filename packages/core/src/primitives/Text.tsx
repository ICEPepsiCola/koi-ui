import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../utils/cn';

const text = tv({
  base: 'text-surface-foreground',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    muted: {
      true: 'text-muted-foreground',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    muted: false,
  },
});

export interface TextProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof text> {
  children?: ReactNode;
  as?: 'span' | 'p' | 'label';
}

export function Text({
  className,
  size,
  weight,
  muted,
  as: Tag = 'span',
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={cn(text({ size, weight, muted }), className)} {...props}>
      {children}
    </Tag>
  );
}
