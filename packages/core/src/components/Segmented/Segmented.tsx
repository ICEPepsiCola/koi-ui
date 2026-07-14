import { useState, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';

const segmentedVariants = tv({
  base: 'inline-flex rounded-lg bg-muted p-1',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    block: {
      true: 'flex w-full',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    block: false,
  },
});

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps extends VariantProps<typeof segmentedVariants> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Segmented({
  className,
  options,
  value,
  defaultValue,
  onChange,
  size,
  block,
}: SegmentedProps) {
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? '',
  );
  const active = value ?? internal;

  const handleChange = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  return (
    <div
      className={cn(segmentedVariants({ size, block }), className)}
      role="tablist"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          disabled={opt.disabled}
          aria-selected={opt.value === active}
          className={cn(
            'rounded-md px-3 py-1.5 font-medium transition-colors',
            block && 'flex-1',
            opt.value === active
              ? 'bg-surface text-surface-foreground shadow-sm'
              : 'text-muted-foreground hover:text-surface-foreground',
            opt.disabled && 'cursor-not-allowed opacity-50',
          )}
          onClick={() => !opt.disabled && handleChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
