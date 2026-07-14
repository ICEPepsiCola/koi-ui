import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const alertVariants = tv({
  base: 'relative flex gap-3 rounded-lg border px-4 py-3 text-sm',
  variants: {
    variant: {
      info: 'border-primary/30 bg-primary/5 text-surface-foreground',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      warning: 'border-amber-200 bg-amber-50 text-amber-800',
      error: 'border-destructive/30 bg-destructive/5 text-destructive',
    },
    closable: {
      true: 'pr-10',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'info',
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
  closable,
  title,
  description,
  icon,
  onClose,
  children,
  ...props
}: AlertProps) {
  const isClosable = closable || Boolean(onClose);

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant, closable: isClosable }), className)}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        {title ? <div className="mb-1 font-medium">{title}</div> : null}
        {description ?? children ? (
          <div className="text-muted-foreground">{description ?? children}</div>
        ) : null}
      </div>
      {isClosable ? (
        <button
          type="button"
          className="absolute right-3 top-3 rounded-sm p-0.5 hover:opacity-70"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
