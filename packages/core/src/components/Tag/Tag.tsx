import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const tagVariants = tv({
  base: 'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
  variants: {
    variant: {
      default: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      destructive: 'bg-destructive/10 text-destructive',
      outline: 'border border-border text-surface-foreground',
    },
    closable: {
      true: 'pr-1',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    closable: false,
  },
});

export interface TagProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  children?: ReactNode;
  onClose?: () => void;
}

export function Tag({
  className,
  variant,
  closable,
  children,
  onClose,
  ...props
}: TagProps) {
  const isClosable = closable || Boolean(onClose);

  return (
    <span
      className={cn(tagVariants({ variant, closable: isClosable }), className)}
      {...props}
    >
      {children}
      {isClosable ? (
        <button
          type="button"
          className="ml-0.5 rounded-sm p-0.5 hover:bg-black/5"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
