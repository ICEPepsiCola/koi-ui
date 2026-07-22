import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:opacity-90',
      soft: 'bg-primary/10 text-primary hover:bg-primary/15',
      outline:
        'border border-primary/40 bg-transparent text-primary hover:bg-primary/5',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-muted border border-border',
      ghost: 'hover:bg-muted text-surface-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:opacity-90',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

function downsize(size: 'sm' | 'md' | 'lg'): 'sm' | 'md' | 'lg' {
  if (size === 'lg') return 'md';
  if (size === 'md') return 'sm';
  return 'sm';
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  responsiveSize?: boolean;
  children?: ReactNode;
}

export function Button({
  className,
  variant,
  size = 'md',
  loading = false,
  responsiveSize = true,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const { isMobile } = useKoiBreakpoint();
  const resolvedSize =
    responsiveSize && isMobile ? downsize(size ?? 'md') : (size ?? 'md');

  return (
    <button
      className={cn(
        buttonVariants({ variant, size: resolvedSize }),
        className,
      )}
      disabled={disabled || loading}
      type="button"
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
