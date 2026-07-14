import { useCallback, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';

const inputNumberVariants = tv({
  slots: {
    root: 'inline-flex w-full items-stretch overflow-hidden rounded-md border border-border bg-surface',
    input:
      'min-w-0 flex-1 border-0 bg-transparent px-3 text-center text-sm text-surface-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    button:
      'inline-flex w-10 shrink-0 items-center justify-center border-border text-sm text-surface-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  },
  variants: {
    size: {
      sm: { input: 'h-8', button: 'h-8' },
      md: { input: 'h-10', button: 'h-10' },
      lg: { input: 'h-12 text-base', button: 'h-12' },
    },
    error: {
      true: { root: 'border-destructive' },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
  },
});

export interface InputNumberProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  className?: string;
  placeholder?: string;
}

export function InputNumber({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  size = 'md',
  error,
  className,
  placeholder,
}: InputNumberProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const { root, input, button } = inputNumberVariants({
    size,
    error: Boolean(error),
  });

  const clamp = useCallback(
    (n: number) => {
      let next = n;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      return next;
    },
    [min, max],
  );

  const update = (next: number | undefined) => {
    if (disabled) return;
    setInternal(next);
  };

  const stepBy = (delta: number) => {
    const base = internal ?? 0;
    update(clamp(base + delta));
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={root()}>
        <button
          type="button"
          className={cn(button(), 'border-r')}
          disabled={disabled || (min !== undefined && (internal ?? 0) <= min)}
          onClick={() => stepBy(-step)}
          aria-label="减少"
        >
          −
        </button>
        <input
          type="number"
          className={input()}
          value={internal ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              update(undefined);
              return;
            }
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) update(clamp(parsed));
          }}
        />
        <button
          type="button"
          className={cn(button(), 'border-l')}
          disabled={disabled || (max !== undefined && (internal ?? 0) >= max)}
          onClick={() => stepBy(step)}
          aria-label="增加"
        >
          +
        </button>
      </div>
      {error ? (
        <Text size="sm" className="mt-1 text-destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}

function useControlled(
  value: number | undefined,
  defaultValue: number | undefined,
  onChange?: (v: number | undefined) => void,
) {
  const [internal, setInternal] = useState<number | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = (next: number | undefined) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
