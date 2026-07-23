import { useCallback, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlText, type ControlColor } from '../../utils/controlColor';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';

const rateVariants = tv({
  base: 'inline-flex items-center gap-0.5',
});

const starVariants = tv({
  base: cn(
    'relative cursor-pointer rounded-selector text-xl leading-none',
    controlTransition,
    focusRing,
    pressable,
  ),
  variants: {
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
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
  color?: ControlColor;
  className?: string;
}

export function Rate({
  value,
  defaultValue = 0,
  onChange,
  count = 5,
  allowHalf = false,
  disabled = false,
  color = 'warning',
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
        const full = display >= index;
        const half = allowHalf && display >= index - 0.5 && display < index;

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            className={cn(starVariants({ disabled }))}
            onMouseMove={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isHalf = allowHalf && e.clientX - rect.left < rect.width / 2;
              setHover(isHalf ? index - 0.5 : index);
            }}
            onClick={(e) => {
              if (disabled) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isHalf = allowHalf && e.clientX - rect.left < rect.width / 2;
              setScore(isHalf ? index - 0.5 : index);
            }}
            aria-label={`${index}`}
          >
            <span aria-hidden className="text-muted-foreground/30">
              ★
            </span>
            {(full || half) && (
              <span
                aria-hidden
                className={cn(
                  'absolute inset-0 overflow-hidden',
                  controlText[color],
                )}
                style={{ width: half ? '50%' : '100%' }}
              >
                ★
              </span>
            )}
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
