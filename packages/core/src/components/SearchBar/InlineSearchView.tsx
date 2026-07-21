import { useState } from 'react';
import { MagnifyingGlassIcon } from '@koi-ui/icons';
import { tv } from 'tailwind-variants';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { ClearButton } from '../shared/ClearButton';

const inlineSearchVariants = tv({
  base: 'flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2',
  variants: {
    focused: {
      true: 'ring-2 ring-primary',
      false: '',
    },
  },
  defaultVariants: {
    focused: false,
  },
});

export interface InlineSearchViewProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function InlineSearchView({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className,
  clearable = false,
}: InlineSearchViewProps) {
  const { messages } = useKoiContext();
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const [focused, setFocused] = useState(false);
  const resolvedPlaceholder = placeholder ?? messages.searchPlaceholder;
  const showClear = clearable && !disabled && internal.length > 0;

  const submit = () => onSearch?.(internal);

  return (
    <div className={cn('w-full', className)}>
      <div className={inlineSearchVariants({ focused })}>
        <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          value={internal}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => setInternal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        {showClear ? (
          <ClearButton
            label={messages.clearActionText}
            onClear={() => setInternal('')}
          />
        ) : null}
        <Button
          variant="primary"
          size="sm"
          disabled={disabled}
          onClick={submit}
        >
          {messages.searchActionText}
        </Button>
      </div>
    </div>
  );
}

function useControlled(
  value: string | undefined,
  defaultValue: string,
  onChange?: (v: string) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return [current, setValue] as const;
}
