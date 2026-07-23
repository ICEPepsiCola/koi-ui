import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import { semanticSurfaceCompounds } from '../../utils/semanticSurface';

/**
 * Tag: daisyUI badge-aligned color × variant
 * (soft / outline / dash / solid / ghost).
 */
const tagVariants = tv({
  base: cn(
    'inline-flex items-center gap-1 rounded-selector border px-2 py-0.5 text-xs font-medium',
    controlTransition,
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
      soft: '',
      outline: '',
      dash: '',
      solid: '',
      ghost: '',
    },
    closable: {
      true: 'pr-1',
      false: '',
    },
  },
  compoundVariants: semanticSurfaceCompounds(),
  defaultVariants: {
    color: 'primary',
    variant: 'soft',
    closable: false,
  },
});

export interface TagProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof tagVariants> {
  children?: ReactNode;
  onClose?: () => void;
}

export function Tag({
  className,
  color,
  variant,
  closable,
  children,
  onClose,
  ...props
}: TagProps) {
  const isClosable = closable || Boolean(onClose);

  return (
    <span
      className={cn(
        tagVariants({ color, variant, closable: isClosable }),
        className,
      )}
      {...props}
    >
      {children}
      {isClosable ? (
        <button
          type="button"
          className="ml-0.5 rounded-selector p-0.5 opacity-70 transition-opacity hover:opacity-100 hover:bg-black/5 active:scale-95"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
