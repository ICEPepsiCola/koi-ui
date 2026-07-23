import { useState, type InputHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlAccent, type ControlColor } from '../../utils/controlColor';
import { Text } from '../../primitives/Text';

const sliderVariants = tv({
  base: 'w-full cursor-pointer appearance-none rounded-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-1.5',
      lg: 'h-2',
    },
    color: {
      neutral: controlAccent.neutral,
      primary: controlAccent.primary,
      secondary: controlAccent.secondary,
      info: controlAccent.info,
      success: controlAccent.success,
      warning: controlAccent.warning,
      error: controlAccent.error,
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export interface SliderProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'size' | 'value' | 'defaultValue' | 'onChange' | 'color'
    >,
    VariantProps<typeof sliderVariants> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
  showValue?: boolean;
}

export function Slider({
  className,
  size,
  color = 'primary',
  value,
  defaultValue = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue = false,
  ...props
}: SliderProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);

  return (
    <div className="w-full">
      <input
        type="range"
        className={cn(sliderVariants({ size, color }), className)}
        min={min}
        max={max}
        step={step}
        value={internal}
        disabled={disabled}
        onChange={(e) => setInternal(Number(e.target.value))}
        {...props}
      />
      {showValue ? (
        <Text size="sm" muted className="mt-1">
          {internal}
        </Text>
      ) : null}
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
