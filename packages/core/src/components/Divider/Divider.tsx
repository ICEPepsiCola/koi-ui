import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const dividerVariants = tv({
  base: 'border-border',
  variants: {
    type: {
      horizontal: 'w-full border-t',
      vertical: 'inline-block h-full min-h-[1em] border-l align-middle',
    },
    dashed: {
      true: 'border-dashed',
      false: 'border-solid',
    },
    plain: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    type: 'horizontal',
    dashed: false,
    plain: true,
  },
});

export interface DividerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  children?: ReactNode;
  orientationMargin?: string | number;
}

export function Divider({
  type = 'horizontal',
  dashed = false,
  plain = true,
  children,
  className,
  orientationMargin,
  ...props
}: DividerProps) {
  if (children && type === 'horizontal') {
    return (
      <div
        className={cn('flex items-center gap-3 text-sm text-muted-foreground', className)}
        role="separator"
        {...props}
      >
        <div
          className={cn(
            'flex-1 border-t border-border',
            dashed && 'border-dashed',
          )}
          style={
            orientationMargin !== undefined
              ? { marginInline: orientationMargin }
              : undefined
          }
        />
        {!plain ? <span>{children}</span> : null}
        <div
          className={cn(
            'flex-1 border-t border-border',
            dashed && 'border-dashed',
          )}
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(dividerVariants({ type, dashed }), className)}
      {...props}
    />
  );
}
