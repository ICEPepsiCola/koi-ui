import { useCallback, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const rateVariants = tv({
  base: 'inline-flex items-center gap-1',
});

const starVariants = tv({
  base: 'cursor-pointer text-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm',
  variants: {
    active: {
      true: 'text-primary',
      false: 'text-muted-foreground',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
    disabled: false,
  },
});

export interface RateProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Rate({
  value,
  defaultValue = 0,
  onChange,
  count = 5,
  allowHalf = false,
  disabled = false,
  className,
}: RateProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? internal;

  const setScore = useCallback(
    (score: number) => {
      if (disabled) return;
      setInternal(score);
    },
    [disabled, setInternal],
  );

  return (
    <div
      className={cn(rateVariants(), className)}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={internal}
      aria-disabled={disabled}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: count }, (_, i) => {
        const index = i + 1;
        const active = display >= index;
        const halfActive = allowHalf && display >= index - 0.5 && display < index;

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            className={cn(
              starVariants({ active: active || halfActive, disabled }),
              'relative',
            )}
            onMouseMove={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const half = allowHalf && e.clientX - rect.left < rect.width / 2;
              setHover(half ? index - 0.5 : index);
            }}
            onClick={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const half = allowHalf && e.clientX - rect.left < rect.width / 2;
              setScore(half ? index - 0.5 : index);
            }}
            aria-label={`${index} 星`}
          >
            {halfActive ? '⯨' : '★'}
          </button>
        );
      })}
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
