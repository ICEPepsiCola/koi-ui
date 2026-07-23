import { useState, type ButtonHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlOnBg, type ControlColor } from '../../utils/controlColor';

const switchVariants = tv({
  slots: {
    track:
      'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-[background-color,box-shadow,transform] duration-fast ease-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100',
    thumb:
      'pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform duration-fast ease-emphasized motion-reduce:transition-none',
  },
  variants: {
    size: {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
      },
    },
    checked: {
      true: {},
      false: { track: 'bg-muted' },
    },
    color: {
      neutral: {},
      primary: {},
      secondary: {},
      info: {},
      success: {},
      warning: {},
      error: {},
    },
  },
  compoundVariants: [
    { size: 'sm', checked: true, class: { thumb: 'translate-x-4' } },
    { size: 'sm', checked: false, class: { thumb: 'translate-x-0.5' } },
    { size: 'md', checked: true, class: { thumb: 'translate-x-5' } },
    { size: 'md', checked: false, class: { thumb: 'translate-x-0.5' } },
    { size: 'lg', checked: true, class: { thumb: 'translate-x-7' } },
    { size: 'lg', checked: false, class: { thumb: 'translate-x-0.5' } },
    ...(['neutral', 'primary', 'secondary', 'info', 'success', 'warning', 'error'] as const).map(
      (color) => ({
        checked: true as const,
        color,
        class: { track: controlOnBg[color] },
      }),
    ),
  ],
  defaultVariants: {
    size: 'md',
    checked: false,
    color: 'primary',
  },
});

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'color'>,
    VariantProps<typeof switchVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: ControlColor;
}

export function Switch({
  className,
  checked,
  defaultChecked = false,
  disabled,
  onChange,
  size = 'md',
  color = 'primary',
  ...props
}: SwitchProps) {
  const [internal, setInternal] = useControlled(checked, defaultChecked, onChange);
  const { track, thumb } = switchVariants({ size, checked: internal, color });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={internal}
      disabled={disabled}
      className={cn(track(), className)}
      onClick={() => setInternal(!internal)}
      {...props}
    >
      <span className={thumb()} />
    </button>
  );
}

function useControlled(
  checked: boolean | undefined,
  defaultChecked: boolean,
  onChange?: (v: boolean) => void,
) {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const current = isControlled ? checked : internal;

  const setValue = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
