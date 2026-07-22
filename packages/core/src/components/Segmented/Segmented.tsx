import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { findEnabledIndex, findNextEnabledIndex } from '../../utils/keyboard';

const segmentedVariants = tv({
  base: 'inline-flex rounded-field bg-muted p-1',
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
    defaultValue ?? options[findEnabledIndex(options)]?.value ?? options[0]?.value ?? '',
  );
  const active = value ?? internal;
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === active),
    0,
  );

  const handleChange = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      handleChange(options[findNextEnabledIndex(options, index, 1)]!.value);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      handleChange(options[findNextEnabledIndex(options, index, -1)]!.value);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      const nextIndex = findEnabledIndex(options);
      if (nextIndex >= 0) handleChange(options[nextIndex]!.value);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const reversedIndex = [...options].reverse().findIndex((option) => !option.disabled);
      if (reversedIndex >= 0) {
        handleChange(options[options.length - reversedIndex - 1]!.value);
      }
    }
  };

  return (
    <div
      className={cn(segmentedVariants({ size, block }), className)}
      role="tablist"
    >
      {options.map((opt, index) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          disabled={opt.disabled}
          aria-selected={opt.value === active}
          tabIndex={index === activeIndex ? 0 : -1}
          className={cn(
            'rounded-selector px-3 py-1.5 font-medium transition-[color,background-color,box-shadow,transform] duration-fast ease-emphasized active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
            block && 'flex-1',
            opt.value === active
              ? 'bg-surface text-surface-foreground shadow-field'
              : 'text-muted-foreground hover:text-surface-foreground',
            opt.disabled && 'cursor-not-allowed opacity-50',
          )}
          onClick={() => !opt.disabled && handleChange(opt.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
