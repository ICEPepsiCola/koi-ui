import { useCallback, useEffect, useRef, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { type ControlColor } from '../../utils/controlColor';
import {
  fieldHeightVariants,
  fieldTextSizeVariants,
} from '../../utils/interaction';
import { Text } from '../../primitives/Text';

const focusRingByColor: Record<ControlColor, string> = {
  neutral: 'focus-within:ring-muted-foreground',
  primary: 'focus-within:ring-primary',
  secondary: 'focus-within:ring-secondary',
  info: 'focus-within:ring-info',
  success: 'focus-within:ring-success',
  warning: 'focus-within:ring-warning',
  error: 'focus-within:ring-error',
};

const buttonTextByColor: Record<ControlColor, string> = {
  neutral: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

const hoverBorderByColor: Record<ControlColor, string> = {
  neutral: 'hover:border-muted-foreground/40',
  primary: 'hover:border-primary/35',
  secondary: 'hover:border-secondary/35',
  info: 'hover:border-info/35',
  success: 'hover:border-success/35',
  warning: 'hover:border-warning/35',
  error: 'hover:border-error/35',
};

const stepperVariants = tv({
  slots: {
    root: cn(
      'inline-flex max-w-full items-stretch overflow-hidden rounded-field border border-border bg-surface shadow-field',
      'transition-[border-color,box-shadow] duration-fast ease-emphasized',
      'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-surface',
      'motion-reduce:transition-none',
    ),
    value: cn(
      'flex min-w-12 flex-1 select-none items-center justify-center px-3',
      'text-center font-medium tabular-nums text-surface-foreground',
    ),
    button: cn(
      'inline-flex w-9 shrink-0 items-center justify-center border-border',
      'transition-[background-color,color,transform] duration-fast ease-emphasized',
      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      'active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      'motion-reduce:transition-none motion-reduce:active:scale-100',
    ),
  },
});

function precisionOf(step: number) {
  const text = String(step);
  const i = text.indexOf('.');
  return i === -1 ? 0 : text.length - i - 1;
}

function roundToStep(value: number, step: number) {
  const p = precisionOf(step);
  const factor = 10 ** p;
  return Math.round(value * factor) / factor;
}

export interface StepperProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Accent color. @default 'primary' */
  color?: ControlColor;
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
  color = 'primary',
  label,
  className,
}: StepperProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const { root, value: valueClass, button } = stepperVariants();
  const heightClass = fieldHeightVariants({ size });
  const textClass = fieldTextSizeVariants({ size });

  const clamp = useCallback(
    (n: number) => {
      let next = roundToStep(n, step);
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      return next;
    },
    [min, max, step],
  );

  const stepBy = useCallback(
    (delta: number) => {
      if (disabled) return;
      setInternal((prev) => clamp(prev + delta));
    },
    [clamp, disabled, setInternal],
  );

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  }, []);

  useEffect(() => clearHold, [clearHold]);

  const onPressStart = (delta: number) => {
    if (disabled) return;
    stepBy(delta);
    clearHold();
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => stepBy(delta), 100);
    }, 400);
  };

  const atMin = min !== undefined && internal <= min;
  const atMax = max !== undefined && internal >= max;
  const btnTone = !disabled ? buttonTextByColor[color] : undefined;

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {label ? (
        <Text size="sm" className="mb-1.5 font-medium">
          {label}
        </Text>
      ) : null}
      <div
        className={cn(
          root(),
          hoverBorderByColor[color],
          focusRingByColor[color],
          disabled && 'pointer-events-none opacity-60',
        )}
        role="group"
        aria-label={label ?? 'stepper'}
      >
        <button
          type="button"
          className={cn(button(), heightClass, textClass, 'border-r', !atMin && btnTone)}
          disabled={disabled || atMin}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            onPressStart(-step);
          }}
          onPointerUp={clearHold}
          onPointerCancel={clearHold}
          aria-label="减少"
        >
          −
        </button>
        <span
          className={cn(valueClass(), heightClass, textClass)}
          aria-live="polite"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={internal}
          role="spinbutton"
        >
          {internal}
        </span>
        <button
          type="button"
          className={cn(button(), heightClass, textClass, 'border-l', !atMax && btnTone)}
          disabled={disabled || atMax}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            onPressStart(step);
          }}
          onPointerUp={clearHold}
          onPointerCancel={clearHold}
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
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const setValue = (next: number | ((prev: number) => number)) => {
    const resolved =
      typeof next === 'function' ? next(currentRef.current) : next;
    currentRef.current = resolved;
    if (!isControlled) setInternal(resolved);
    onChange?.(resolved);
  };

  return [current, setValue] as const;
}
