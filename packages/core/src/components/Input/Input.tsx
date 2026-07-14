import type { InputHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';

const inputVariants = tv({
  base: 'w-full rounded-md border border-border bg-surface px-3 text-surface-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    },
    error: {
      true: 'border-destructive focus-visible:ring-destructive',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
  },
});

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>,
    Omit<VariantProps<typeof inputVariants>, 'error'> {
  onChange?: (value: string) => void;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Input({
  className,
  size,
  error,
  onChange,
  ...props
}: InputProps) {
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <input
        className={cn(inputVariants({ size, error: hasError }), className)}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {error ? (
        <Text size="sm" className="mt-1 text-destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
