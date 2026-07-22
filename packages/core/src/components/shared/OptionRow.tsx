import type { ButtonHTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';
import { CheckIcon, ChevronRightIcon } from '@koi-ui/icons';
import { cn } from '../../utils/cn';
import {
  optionRowActive,
  optionRowBase,
  optionRowInteractive,
  optionRowSelected,
} from '../../utils/interaction';

export interface OptionRowProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected?: boolean;
  /** Keyboard / pointer highlight (may differ from selected). */
  active?: boolean;
  disabled?: boolean;
  /** Show trailing chevron (cascader branches). */
  hasChildren?: boolean;
  children?: ReactNode;
  as?: 'button' | 'li';
}

/**
 * Refined option row with soft highlight + check affordance.
 */
export function OptionRow({
  selected = false,
  active = false,
  disabled = false,
  hasChildren = false,
  children,
  className,
  as = 'button',
  type = 'button',
  ...props
}: OptionRowProps) {
  const classes = cn(
    optionRowBase,
    !disabled && optionRowInteractive,
    (active || selected) && optionRowActive,
    selected && !active && optionRowSelected,
    disabled && 'cursor-not-allowed opacity-40',
    className,
  );

  const content = (
    <>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hasChildren ? (
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      ) : selected ? (
        <CheckIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      ) : (
        <span className="h-4 w-4 shrink-0" aria-hidden />
      )}
    </>
  );

  if (as === 'li') {
    const liProps = props as LiHTMLAttributes<HTMLLIElement>;
    return (
      <li className={classes} aria-disabled={disabled || undefined} {...liProps}>
        {content}
      </li>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      aria-selected={selected}
      {...props}
    >
      {content}
    </button>
  );
}
