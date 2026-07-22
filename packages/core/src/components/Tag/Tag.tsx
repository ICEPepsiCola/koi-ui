import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const tagVariants = tv({
  base: 'inline-flex items-center gap-1 rounded-selector px-2 py-0.5 text-xs font-medium transition-[color,background-color,border-color,transform] duration-fast ease-emphasized motion-reduce:transition-none',
  variants: {
    variant: {
      default: 'bg-primary/10 text-primary',
      soft: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      destructive: 'bg-destructive/10 text-destructive',
      outline: 'border border-border text-surface-foreground',
      ghost: 'text-muted-foreground hover:bg-muted',
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
          className="ml-0.5 rounded-selector p-0.5 transition-colors duration-fast ease-emphasized hover:bg-black/5 active:scale-95 motion-reduce:transition-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
