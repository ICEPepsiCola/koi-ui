import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const alertVariants = tv({
  base: 'relative flex gap-3 rounded-box border px-4 py-3 text-sm shadow-field',
  variants: {
    variant: {
      info: '',
      success: '',
      warning: '',
      error: '',
    },
    appearance: {
      soft: '',
      outline: 'bg-transparent',
      solid: 'border-transparent',
    },
    closable: {
      true: 'pr-10',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'info',
      appearance: 'soft',
      class: 'border-info/30 bg-info/10 text-surface-foreground',
    },
    {
      variant: 'success',
      appearance: 'soft',
      class: 'border-success/30 bg-success/10 text-surface-foreground',
    },
    {
      variant: 'warning',
      appearance: 'soft',
      class: 'border-warning/30 bg-warning/10 text-surface-foreground',
    },
    {
      variant: 'error',
      appearance: 'soft',
      class: 'border-destructive/30 bg-destructive/10 text-surface-foreground',
    },
    {
      variant: 'info',
      appearance: 'outline',
      class: 'border-info text-info',
    },
    {
      variant: 'success',
      appearance: 'outline',
      class: 'border-success text-success',
    },
    {
      variant: 'warning',
      appearance: 'outline',
      class: 'border-warning text-warning',
    },
    {
      variant: 'error',
      appearance: 'outline',
      class: 'border-destructive text-destructive',
    },
    {
      variant: 'info',
      appearance: 'solid',
      class: 'bg-info text-info-foreground',
    },
    {
      variant: 'success',
      appearance: 'solid',
      class: 'bg-success text-success-foreground',
    },
    {
      variant: 'warning',
      appearance: 'solid',
      class: 'bg-warning text-warning-foreground',
    },
    {
      variant: 'error',
      appearance: 'solid',
      class: 'bg-destructive text-destructive-foreground',
    },
  ],
  defaultVariants: {
    variant: 'info',
    appearance: 'soft',
    closable: false,
  },
});

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
}

export function Alert({
  className,
  variant,
  appearance,
  closable,
  title,
  description,
  icon,
  onClose,
  children,
  ...props
}: AlertProps) {
  const isClosable = closable || Boolean(onClose);
  const isSolid = appearance === 'solid';

  return (
    <div
      role="alert"
      className={cn(
        alertVariants({ variant, appearance, closable: isClosable }),
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        {title ? <div className="mb-1 font-medium">{title}</div> : null}
        {description ?? children ? (
          <div className={isSolid ? 'opacity-90' : 'text-muted-foreground'}>
            {description ?? children}
          </div>
        ) : null}
      </div>
      {isClosable ? (
        <button
          type="button"
          className="absolute right-3 top-3 rounded-selector p-0.5 transition-colors duration-fast ease-emphasized hover:bg-black/5 motion-reduce:transition-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
