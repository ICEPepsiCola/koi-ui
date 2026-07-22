import { useState, type InputHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';
import { useKoiContext } from '../../provider/context';
import { ClearButton } from '../shared/ClearButton';
import { fieldBase } from '../../utils/interaction';

const inputVariants = tv({
  base: cn(
    'w-full px-3 text-surface-foreground placeholder:text-muted-foreground',
    fieldBase,
  ),
  variants: {
    size: {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    },
    error: {
      true: 'border-destructive hover:border-destructive focus-visible:ring-destructive',
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
  /** String shows message; boolean only styles the border (Form.Item owns copy). */
  error?: string | boolean;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
}

export function Input({
  className,
  size,
  error,
  onChange,
  value,
  defaultValue,
  disabled,
  clearable = false,
  ...props
}: InputProps) {
  const { messages } = useKoiContext();
  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;
  const [internal, setInternal] = useState(
    (defaultValue as string | undefined) ?? '',
  );
  // onChange-only (Form.Item) counts as controlled so empty stays synced
  const controlled = value !== undefined || onChange !== undefined;
  const current = controlled ? String(value ?? '') : internal;
  const showClear = clearable && !disabled && current.length > 0;

  const update = (next: string) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          className={cn(
            inputVariants({ size, error: hasError }),
            showClear && 'pr-10',
            className,
          )}
          value={current}
          disabled={disabled}
          onChange={(e) => update(e.target.value)}
          {...props}
        />
        {showClear ? (
          <ClearButton
            label={messages.clearActionText}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClear={() => update('')}
          />
        ) : null}
      </div>
      {errorMessage ? (
        <Text size="sm" className="mt-1 text-destructive">
          {errorMessage}
        </Text>
      ) : null}
    </div>
  );
}
