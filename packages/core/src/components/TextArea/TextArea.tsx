import { useState, type TextareaHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';
import { useKoiContext } from '../../provider/context';
import { ClearButton } from '../shared/ClearButton';

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
  clearable?: boolean;
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
  disabled,
  clearable = false,
  ...props
}: TextAreaProps) {
  const { messages } = useKoiContext();
  const hasError = Boolean(error);
  const [internal, setInternal] = useState(
    (defaultValue as string | undefined) ?? '',
  );
  const current = value !== undefined ? String(value) : internal;
  const count = current.length;
  const showClear = clearable && !disabled && current.length > 0;

  const update = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          className={cn(
            textAreaVariants({ size, error: hasError }),
            showClear && 'pr-10',
            className,
          )}
          value={current}
          disabled={disabled}
          maxLength={maxLength}
          onChange={(e) => update(e.target.value)}
          {...props}
        />
        {showClear ? (
          <ClearButton
            label={messages.clearActionText}
            className="absolute right-2 top-2"
            onClear={() => update('')}
          />
        ) : null}
      </div>
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
