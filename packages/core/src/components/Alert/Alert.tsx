import type { HTMLAttributes, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import {
  semanticSurfaceCompounds,
  StatusIcon,
  type StatusColor,
} from '../../utils/semanticSurface';

/**
 * Alert: daisyUI-aligned color × variant (soft / outline / dash / solid),
 * default status icons, optional action slot, horizontal / vertical layout.
 */
const alertVariants = tv({
  base: cn(
    'relative flex w-full gap-3 rounded-box border px-4 py-3 text-sm',
    'text-start shadow-field',
  ),
  variants: {
    color: {
      neutral: '',
      info: '',
      success: '',
      warning: '',
      error: '',
    },
    variant: {
      soft: 'shadow-none',
      outline: 'bg-transparent shadow-none',
      dash: 'border-dashed bg-transparent shadow-none',
      solid: 'border-transparent shadow-field',
    },
    layout: {
      horizontal: 'flex-row items-center',
      vertical: 'flex-col items-center text-center',
    },
  },
  compoundVariants: semanticSurfaceCompounds(
    ['neutral', 'info', 'success', 'warning', 'error'],
    ['soft', 'outline', 'dash', 'solid'],
  ),
  defaultVariants: {
    color: 'info',
    variant: 'soft',
    layout: 'horizontal',
  },
});

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'>,
    VariantProps<typeof alertVariants> {
  title?: ReactNode;
  description?: ReactNode;
  /** Custom icon. Pass `null` to hide the default status icon. */
  icon?: ReactNode | null;
  /** Trailing actions (e.g. buttons). */
  action?: ReactNode;
  /**
   * Vertical on narrow screens, horizontal from `sm` up.
   * Overrides `layout` when true.
   */
  responsive?: boolean;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export function Alert({
  className,
  color = 'info',
  variant = 'soft',
  layout = 'horizontal',
  closable,
  responsive = false,
  title,
  description,
  icon,
  action,
  onClose,
  children,
  ...props
}: AlertProps) {
  const isClosable = closable || Boolean(onClose);
  const isSolid = variant === 'solid';
  const iconColor: StatusColor | 'neutral' =
    color === 'neutral' ? 'neutral' : (color ?? 'info');
  const resolvedIcon =
    icon === undefined ? <StatusIcon color={iconColor} /> : icon;

  return (
    <div
      role="alert"
      className={cn(
        alertVariants({
          color,
          variant,
          layout: responsive ? 'vertical' : layout,
        }),
        responsive && 'sm:flex-row sm:items-center sm:text-start',
        className,
      )}
      {...props}
    >
      {resolvedIcon ? (
        <span className="shrink-0 self-center">{resolvedIcon}</span>
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <div className="font-bold leading-snug">{title}</div> : null}
        {description ?? children ? (
          <div
            className={cn(
              title ? 'mt-0.5 text-xs' : '',
              isSolid ? 'opacity-90' : 'opacity-80',
            )}
          >
            {description ?? children}
          </div>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-start">
          {action}
        </div>
      ) : null}
      {isClosable ? (
        <button
          type="button"
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-selector self-center',
            'opacity-70 hover:opacity-100',
            controlTransition,
            isSolid ? 'hover:bg-black/10' : 'hover:bg-black/5',
          )}
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="size-4 stroke-current"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
