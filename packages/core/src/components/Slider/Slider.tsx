import {
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlAccent, type ControlColor } from '../../utils/controlColor';
import { Text } from '../../primitives/Text';
import { focusRing } from '../../utils/interaction';

const thumbBase = [
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-0',
  '[&::-webkit-slider-thumb]:shadow-field [&::-webkit-slider-thumb]:transition-transform',
  '[&::-webkit-slider-thumb]:duration-100 [&::-webkit-slider-thumb]:ease-out',
  'active:[&::-webkit-slider-thumb]:scale-[0.97]',
  '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:shadow-field',
].join(' ');

/** Filled track via --koi-slider-*; remainder uses fill-secondary. */
const trackBase = [
  '[&::-webkit-slider-runnable-track]:rounded-full',
  '[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--koi-slider-fill)_0%,var(--koi-slider-fill)_var(--koi-slider-progress),var(--color-fill-secondary)_var(--koi-slider-progress),var(--color-fill-secondary)_100%)]',
  '[&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-fill-secondary',
  '[&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[var(--koi-slider-fill)]',
].join(' ');

/**
 * WebKit places the thumb relative to the tall input box after `min-h-11`.
 * Margin = (trackHeight - thumbHeight) / 2 so the thumb sits on the track.
 */
const thumbAlign = {
  sm: '[&::-webkit-slider-thumb]:-mt-1.5', // (4 - 16) / 2
  md: '[&::-webkit-slider-thumb]:-mt-[0.4375rem]', // (6 - 20) / 2 = -7px
  lg: '[&::-webkit-slider-thumb]:-mt-2', // (8 - 24) / 2
} as const;

const thumbColor: Record<ControlColor, string> = {
  neutral:
    '[&::-webkit-slider-thumb]:bg-muted-foreground [&::-moz-range-thumb]:bg-muted-foreground',
  primary: '[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary',
  secondary: '[&::-webkit-slider-thumb]:bg-secondary [&::-moz-range-thumb]:bg-secondary',
  info: '[&::-webkit-slider-thumb]:bg-info [&::-moz-range-thumb]:bg-info',
  success: '[&::-webkit-slider-thumb]:bg-success [&::-moz-range-thumb]:bg-success',
  warning: '[&::-webkit-slider-thumb]:bg-warning [&::-moz-range-thumb]:bg-warning',
  error: '[&::-webkit-slider-thumb]:bg-error [&::-moz-range-thumb]:bg-error',
};

const fillVar: Record<ControlColor, string> = {
  neutral: 'var(--color-muted-foreground)',
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

const sliderVariants = tv({
  base: cn(
    'w-full min-h-11 cursor-pointer appearance-none bg-transparent touch-manipulation',
    focusRing,
    'rounded-full disabled:cursor-not-allowed disabled:opacity-50',
    thumbBase,
    trackBase,
  ),
  variants: {
    size: {
      sm: cn(
        '[&::-webkit-slider-runnable-track]:h-1 [&::-moz-range-track]:h-1',
        '[&::-moz-range-progress]:h-1',
        '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
        '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
        thumbAlign.sm,
      ),
      md: cn(
        '[&::-webkit-slider-runnable-track]:h-1.5 [&::-moz-range-track]:h-1.5',
        '[&::-moz-range-progress]:h-1.5',
        '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
        '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5',
        thumbAlign.md,
      ),
      lg: cn(
        '[&::-webkit-slider-runnable-track]:h-2 [&::-moz-range-track]:h-2',
        '[&::-moz-range-progress]:h-2',
        '[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6',
        '[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6',
        thumbAlign.lg,
      ),
    },
    color: {
      neutral: cn(controlAccent.neutral, thumbColor.neutral),
      primary: cn(controlAccent.primary, thumbColor.primary),
      secondary: cn(controlAccent.secondary, thumbColor.secondary),
      info: cn(controlAccent.info, thumbColor.info),
      success: cn(controlAccent.success, thumbColor.success),
      warning: cn(controlAccent.warning, thumbColor.warning),
      error: cn(controlAccent.error, thumbColor.error),
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
  style,
  ...props
}: SliderProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const progress =
    max === min ? 0 : Math.min(100, Math.max(0, ((internal - min) / (max - min)) * 100));
  const sliderStyle = {
    ...style,
    '--koi-slider-progress': `${progress}%`,
    '--koi-slider-fill': fillVar[color],
  } as CSSProperties;

  return (
    <div className="w-full">
      <input
        type="range"
        className={cn(sliderVariants({ size, color }), className)}
        style={sliderStyle}
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
