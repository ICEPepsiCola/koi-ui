import { useState, type ButtonHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const switchVariants = tv({
  slots: {
    track:
      'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
    thumb:
      'pointer-events-none inline-block rounded-full bg-white shadow-sm transition-transform',
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
      true: { track: 'bg-primary' },
      false: { track: 'bg-muted' },
    },
  },
  compoundVariants: [
    { size: 'sm', checked: true, class: { thumb: 'translate-x-4' } },
    { size: 'sm', checked: false, class: { thumb: 'translate-x-0.5' } },
    { size: 'md', checked: true, class: { thumb: 'translate-x-5' } },
    { size: 'md', checked: false, class: { thumb: 'translate-x-0.5' } },
    { size: 'lg', checked: true, class: { thumb: 'translate-x-7' } },
    { size: 'lg', checked: false, class: { thumb: 'translate-x-0.5' } },
  ],
  defaultVariants: {
    size: 'md',
    checked: false,
  },
});

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof switchVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function Switch({
  className,
  checked,
  defaultChecked = false,
  disabled,
  onChange,
  size = 'md',
  ...props
}: SwitchProps) {
  const [internal, setInternal] = useControlled(checked, defaultChecked, onChange);
  const { track, thumb } = switchVariants({ size, checked: internal });

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
