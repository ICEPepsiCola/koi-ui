import { useCallback, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { boxSurface, controlTransition, focusRing, pressable } from '../../utils/interaction';
import { Text } from '../../primitives/Text';

const stepperVariants = tv({
  slots: {
    root: cn('inline-flex w-full items-center justify-between gap-3 px-3 py-2', boxSurface),
    value: 'min-w-0 flex-1 text-center text-lg font-medium text-surface-foreground',
    button: cn(
      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-selector bg-muted text-xl font-medium text-surface-foreground',
      controlTransition,
      focusRing,
      pressable,
      'hover:bg-border disabled:cursor-not-allowed disabled:opacity-50',
    ),
  },
  variants: {
    size: {
      sm: { button: 'h-8 w-8 text-lg', value: 'text-base' },
      md: { button: 'h-10 w-10 text-xl', value: 'text-lg' },
      lg: { button: 'h-12 w-12 text-2xl', value: 'text-xl' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface StepperProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function Stepper({
  value,
  defaultValue = 0,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  size = 'md',
  label,
  className,
}: StepperProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const { root, value: valueClass, button } = stepperVariants({ size });

  const clamp = useCallback(
    (n: number) => {
      let next = n;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      return next;
    },
    [min, max],
  );

  const stepBy = (delta: number) => {
    if (disabled) return;
    setInternal(clamp(internal + delta));
  };

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <Text size="sm" className="mb-2 font-medium">
          {label}
        </Text>
      ) : null}
      <div className={root()}>
        <button
          type="button"
          className={button()}
          disabled={disabled || (min !== undefined && internal <= min)}
          onClick={() => stepBy(-step)}
          aria-label="减少"
        >
          −
        </button>
        <span className={valueClass()}>{internal}</span>
        <button
          type="button"
          className={button()}
          disabled={disabled || (max !== undefined && internal >= max)}
          onClick={() => stepBy(step)}
          aria-label="增加"
        >
          +
        </button>
      </div>
    </div>
  );
}

function useControlled(
  value: number | undefined,
  defaultValue: number,
  onChange?: (v: number) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = (next: number) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
