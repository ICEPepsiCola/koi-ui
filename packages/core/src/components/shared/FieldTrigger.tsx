import type {
  HTMLAttributes,
  KeyboardEventHandler,
  ReactNode,
} from 'react';
import { ChevronDownIcon } from '@koi-ui/icons';
import { cn } from '../../utils/cn';
import {
  controlTransition,
  fieldBase,
  fieldTriggerOpen,
  focusRing,
} from '../../utils/interaction';
import { ClearButton } from './ClearButton';

export interface FieldTriggerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  open?: boolean;
  disabled?: boolean;
  /** Whether the field currently shows a committed value. */
  hasValue?: boolean;
  display?: ReactNode;
  placeholder: string;
  clearable?: boolean;
  clearLabel?: string;
  onClear?: () => void;
  /** Extra trailing control before the chevron (optional). */
  trailing?: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

/**
 * Shared chrome for Select / Picker / Cascader / Date / Time triggers.
 */
export function FieldTrigger({
  open = false,
  disabled = false,
  hasValue = false,
  display,
  placeholder,
  clearable = false,
  clearLabel = 'Clear',
  onClear,
  trailing,
  className,
  onKeyDown,
  ...props
}: FieldTriggerProps) {
  const showClear = clearable && !disabled && hasValue && Boolean(onClear);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={cn(
        'group/trigger flex h-10 w-full items-center justify-between gap-2 px-3 text-sm',
        fieldBase,
        focusRing,
        open && fieldTriggerOpen,
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'cursor-pointer',
        className,
      )}
      onKeyDown={onKeyDown}
      {...props}
    >
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-left leading-snug',
          hasValue ? 'text-surface-foreground' : 'text-muted-foreground',
        )}
      >
        {hasValue ? display : placeholder}
      </span>
      <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
        {trailing}
        {showClear ? (
          <ClearButton label={clearLabel} onClear={onClear!} />
        ) : null}
        <ChevronDownIcon
          className={cn(
            'h-4 w-4',
            controlTransition,
            open && 'rotate-180 text-primary',
            'group-hover/trigger:text-surface-foreground',
          )}
          aria-hidden
        />
      </span>
    </div>
  );
}
