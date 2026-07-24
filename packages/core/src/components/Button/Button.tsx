import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing } from '../../utils/interaction';

/**
 * Button: color × variant axes (solid / soft / outline / dash / ghost / link),
 * press translate + flatten shadow, hover darken on solid, sizes xs→xl,
 * square / circle, block / wide.
 */
const buttonVariants = tv({
  base: cn(
    'inline-flex shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center gap-1.5',
    'rounded-field border text-center align-middle font-semibold',
    'outline-offset-2',
    controlTransition,
    focusRing,
    // press: nudge down + drop elevation
    'active:translate-y-px active:shadow-none motion-reduce:active:translate-y-0',
    // disabled: flat mute
    'disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed',
    'disabled:border-transparent disabled:bg-surface-foreground/10 disabled:text-surface-foreground/25 disabled:shadow-none',
    'disabled:no-underline',
  ),
  variants: {
    color: {
      neutral: '',
      primary: '',
      secondary: '',
      info: '',
      success: '',
      warning: '',
      error: '',
    },
    variant: {
      solid: 'border-solid shadow-field',
      soft: 'border-solid shadow-none',
      outline: 'border-solid bg-transparent shadow-none',
      dash: 'border-dashed bg-transparent shadow-none',
      ghost:
        'border-transparent bg-transparent shadow-none disabled:bg-transparent',
      link: 'border-transparent bg-transparent shadow-none underline underline-offset-4 disabled:bg-transparent',
    },
    size: {
      xs: 'h-5 min-h-5 px-2 text-xs',
      sm: 'h-6 min-h-6 px-2.5 text-sm',
      md: 'h-8 min-h-8 px-3 text-sm',
      lg: 'h-10 min-h-10 px-4 text-base',
      xl: 'h-12 min-h-12 px-5 text-lg',
    },
    shape: {
      default: '',
      square: 'aspect-square px-0',
      circle: 'aspect-square rounded-full px-0',
    },
    block: {
      true: 'w-full',
      false: '',
    },
    wide: {
      true: 'w-full max-w-64',
      false: '',
    },
    active: {
      true: 'translate-y-px shadow-none',
      false: '',
    },
  },
  compoundVariants: [
    // —— solid（hover 用 color-mix 压暗底色，比 brightness 更明显且不脏字色）——
    {
      variant: 'solid',
      color: 'neutral',
      class:
        'border-border bg-muted text-surface-foreground hover:bg-[color-mix(in_oklab,var(--color-muted),black_10%)] active:bg-[color-mix(in_oklab,var(--color-muted),black_14%)]',
    },
    {
      variant: 'solid',
      color: 'primary',
      class:
        'border-primary bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--color-primary),black_10%)] active:bg-[color-mix(in_oklab,var(--color-primary),black_14%)]',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class:
        'border-secondary bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--color-secondary),black_10%)] active:bg-[color-mix(in_oklab,var(--color-secondary),black_14%)]',
    },
    {
      variant: 'solid',
      color: 'info',
      class:
        'border-info bg-info text-info-foreground hover:bg-[color-mix(in_oklab,var(--color-info),black_10%)] active:bg-[color-mix(in_oklab,var(--color-info),black_14%)]',
    },
    {
      variant: 'solid',
      color: 'success',
      class:
        'border-success bg-success text-success-foreground hover:bg-[color-mix(in_oklab,var(--color-success),black_10%)] active:bg-[color-mix(in_oklab,var(--color-success),black_14%)]',
    },
    {
      variant: 'solid',
      color: 'warning',
      class:
        'border-warning bg-warning text-warning-foreground hover:bg-[color-mix(in_oklab,var(--color-warning),black_10%)] active:bg-[color-mix(in_oklab,var(--color-warning),black_14%)]',
    },
    {
      variant: 'solid',
      color: 'error',
      class:
        'border-error bg-error text-error-foreground hover:bg-[color-mix(in_oklab,var(--color-error),black_10%)] active:bg-[color-mix(in_oklab,var(--color-error),black_14%)]',
    },

    // —— soft ——
    {
      variant: 'soft',
      color: 'neutral',
      class:
        'border-muted-foreground/10 bg-muted text-surface-foreground hover:bg-muted/70 active:bg-muted/60',
    },
    {
      variant: 'soft',
      color: 'primary',
      class:
        'border-primary/10 bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/25',
    },
    {
      variant: 'soft',
      color: 'secondary',
      class:
        'border-secondary/15 bg-secondary/10 text-secondary hover:bg-secondary/15 active:bg-secondary/20',
    },
    {
      variant: 'soft',
      color: 'info',
      class:
        'border-info/10 bg-info/10 text-info hover:bg-info/20 active:bg-info/25',
    },
    {
      variant: 'soft',
      color: 'success',
      class:
        'border-success/10 bg-success/10 text-success hover:bg-success/20 active:bg-success/25',
    },
    {
      variant: 'soft',
      color: 'warning',
      class:
        'border-warning/10 bg-warning/10 text-warning hover:bg-warning/20 active:bg-warning/25',
    },
    {
      variant: 'soft',
      color: 'error',
      class:
        'border-error/10 bg-error/10 text-error hover:bg-error/20 active:bg-error/25',
    },

    // —— outline ——
    {
      variant: 'outline',
      color: 'neutral',
      class:
        'border-border text-surface-foreground hover:bg-muted active:bg-muted/80',
    },
    {
      variant: 'outline',
      color: 'primary',
      class:
        'border-primary/40 text-primary hover:border-primary hover:bg-primary/10 active:bg-primary/15',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class:
        'border-secondary/40 text-secondary hover:border-secondary hover:bg-secondary/10 active:bg-secondary/15',
    },
    {
      variant: 'outline',
      color: 'info',
      class:
        'border-info/40 text-info hover:border-info hover:bg-info/10 active:bg-info/15',
    },
    {
      variant: 'outline',
      color: 'success',
      class:
        'border-success/40 text-success hover:border-success hover:bg-success/10 active:bg-success/15',
    },
    {
      variant: 'outline',
      color: 'warning',
      class:
        'border-warning/40 text-warning hover:border-warning hover:bg-warning/10 active:bg-warning/15',
    },
    {
      variant: 'outline',
      color: 'error',
      class:
        'border-error/40 text-error hover:border-error hover:bg-error/10 active:bg-error/15',
    },

    // —— dash (same colors as outline, dashed border already on variant) ——
    {
      variant: 'dash',
      color: 'neutral',
      class:
        'border-border text-surface-foreground hover:bg-muted active:bg-muted/80',
    },
    {
      variant: 'dash',
      color: 'primary',
      class:
        'border-primary/40 text-primary hover:border-primary hover:bg-primary/10 active:bg-primary/15',
    },
    {
      variant: 'dash',
      color: 'secondary',
      class:
        'border-secondary/40 text-secondary hover:border-secondary hover:bg-secondary/10 active:bg-secondary/15',
    },
    {
      variant: 'dash',
      color: 'info',
      class:
        'border-info/40 text-info hover:border-info hover:bg-info/10 active:bg-info/15',
    },
    {
      variant: 'dash',
      color: 'success',
      class:
        'border-success/40 text-success hover:border-success hover:bg-success/10 active:bg-success/15',
    },
    {
      variant: 'dash',
      color: 'warning',
      class:
        'border-warning/40 text-warning hover:border-warning hover:bg-warning/10 active:bg-warning/15',
    },
    {
      variant: 'dash',
      color: 'error',
      class:
        'border-error/40 text-error hover:border-error hover:bg-error/10 active:bg-error/15',
    },

    // —— ghost ——
    {
      variant: 'ghost',
      color: 'neutral',
      class: 'text-surface-foreground hover:bg-muted active:bg-muted/80',
    },
    {
      variant: 'ghost',
      color: 'primary',
      class: 'text-primary hover:bg-primary/15 active:bg-primary/20',
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class: 'text-secondary hover:bg-secondary/10 active:bg-secondary/15',
    },
    {
      variant: 'ghost',
      color: 'info',
      class: 'text-info hover:bg-info/15 active:bg-info/20',
    },
    {
      variant: 'ghost',
      color: 'success',
      class: 'text-success hover:bg-success/15 active:bg-success/20',
    },
    {
      variant: 'ghost',
      color: 'warning',
      class: 'text-warning hover:bg-warning/15 active:bg-warning/20',
    },
    {
      variant: 'ghost',
      color: 'error',
      class: 'text-error hover:bg-error/15 active:bg-error/20',
    },

    // —— link ——
    {
      variant: 'link',
      color: 'neutral',
      class: 'text-surface-foreground hover:opacity-80 active:opacity-70',
    },
    {
      variant: 'link',
      color: 'primary',
      class: 'text-primary hover:opacity-80 active:opacity-70',
    },
    {
      variant: 'link',
      color: 'secondary',
      class: 'text-secondary hover:opacity-80 active:opacity-70',
    },
    {
      variant: 'link',
      color: 'info',
      class: 'text-info hover:opacity-80 active:opacity-70',
    },
    {
      variant: 'link',
      color: 'success',
      class: 'text-success hover:opacity-80 active:opacity-70',
    },
    {
      variant: 'link',
      color: 'warning',
      class: 'text-warning hover:opacity-80 active:opacity-70',
    },
    {
      variant: 'link',
      color: 'error',
      class: 'text-error hover:opacity-80 active:opacity-70',
    },
  ],
  defaultVariants: {
    color: 'neutral',
    variant: 'solid',
    size: 'md',
    shape: 'default',
    block: false,
    wide: false,
    active: false,
  },
});

function downsize(
  size: NonNullable<VariantProps<typeof buttonVariants>['size']>,
): NonNullable<VariantProps<typeof buttonVariants>['size']> {
  if (size === 'xl') return 'lg';
  if (size === 'lg') return 'md';
  if (size === 'md') return 'sm';
  if (size === 'sm') return 'xs';
  return 'xs';
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Shrink one size step on mobile breakpoints. */
  responsiveSize?: boolean;
  children?: ReactNode;
}

export function Button({
  className,
  color = 'neutral',
  variant = 'solid',
  size = 'md',
  shape = 'default',
  block = false,
  wide = false,
  active = false,
  loading = false,
  responsiveSize = true,
  disabled = false,
  children,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const { isMobile } = useKoiBreakpoint();
  const resolvedSize =
    responsiveSize && isMobile ? downsize(size ?? 'md') : (size ?? 'md');
  const isDisabled = Boolean(disabled || loading);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...props}
      type={type}
      className={cn(
        buttonVariants({
          color,
          variant,
          size: resolvedSize,
          shape,
          block,
          wide,
          active,
        }),
        loading && 'cursor-wait!',
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading || undefined}
      data-active={active || undefined}
      onClick={handleClick}
    >
      {loading ? (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-[1em] w-[1em] animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export { buttonVariants };
