import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';
import { Portal } from '../../utils/portal';

const floatButtonVariants = tv({
  base: cn(
    'fixed z-40 flex items-center justify-center rounded-full shadow-float',
    controlTransition,
    focusRing,
    pressable,
    'motion-reduce:transition-none',
  ),
  variants: {
    variant: {
      primary:
        'bg-primary text-primary-foreground hover:brightness-[1.04] active:brightness-[0.96]',
      secondary:
        'border border-border bg-surface text-surface-foreground hover:bg-muted',
    },
    size: {
      sm: 'h-10 w-10',
      md: 'h-12 w-12',
      lg: 'h-14 w-14',
    },
    placement: {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    placement: 'bottom-right',
  },
});

export interface FloatButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof floatButtonVariants> {
  icon?: ReactNode;
  description?: ReactNode;
}

export function FloatButton({
  className,
  variant,
  size,
  placement,
  icon,
  description,
  children,
  ...props
}: FloatButtonProps) {
  return (
    <Portal>
      <button
        type="button"
        className={cn(floatButtonVariants({ variant, size, placement }), className)}
        {...props}
      >
        {icon ?? children}
        {description ? (
          <span className="sr-only">{description}</span>
        ) : null}
      </button>
    </Portal>
  );
}
