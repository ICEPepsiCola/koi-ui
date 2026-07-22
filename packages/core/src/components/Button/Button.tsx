import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  focusRing,
  pressable,
} from '../../utils/interaction';

const buttonVariants = tv({
  base: cn(
    'inline-flex items-center justify-center rounded-field font-medium',
    controlTransition,
    focusRing,
    pressable,
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  variants: {
    variant: {
      primary:
        'bg-primary text-primary-foreground shadow-field hover:brightness-[1.04] active:brightness-[0.96]',
      soft: 'bg-primary/10 text-primary hover:bg-primary/15',
      outline:
        'border border-primary/35 bg-transparent text-primary hover:bg-primary/5',
      secondary:
        'border border-border bg-secondary text-secondary-foreground hover:bg-muted',
      ghost: 'text-surface-foreground hover:bg-muted',
      destructive:
        'bg-destructive text-destructive-foreground shadow-field hover:brightness-[1.04] active:brightness-[0.96]',
    },
    size: {
      sm: 'h-6 px-2.5 text-sm',
      md: 'h-8 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
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
