import { useState, type TextareaHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';

const textAreaVariants = tv({
  base: 'w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-surface-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'min-h-20 text-sm',
      md: 'min-h-24 text-sm',
      lg: 'min-h-32 text-base',
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

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>,
    Omit<VariantProps<typeof textAreaVariants>, 'error'> {
  onChange?: (value: string) => void;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  maxLength?: number;
}

export function TextArea({
  className,
  size,
  error,
  onChange,
  showCount = false,
  maxLength,
  value,
  defaultValue,
  ...props
}: TextAreaProps) {
  const hasError = Boolean(error);
  const [internal, setInternal] = useState(
    (defaultValue as string | undefined) ?? '',
  );
  const current =
    value !== undefined ? String(value) : internal;
  const count = current.length;

  return (
    <div className="w-full">
      <textarea
        className={cn(textAreaVariants({ size, error: hasError }), className)}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={(e) => {
          if (value === undefined) setInternal(e.target.value);
          onChange?.(e.target.value);
        }}
        {...props}
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : (
          <span />
        )}
        {showCount ? (
          <Text size="sm" muted>
            {count}
            {maxLength ? ` / ${maxLength}` : ''}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
