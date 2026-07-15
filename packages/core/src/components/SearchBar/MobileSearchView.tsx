import { useState } from 'react';
import { tv } from 'tailwind-variants';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';

const mobileSearchVariants = tv({
  base: 'flex w-full items-center gap-2',
});

const mobileInputVariants = tv({
  base: 'h-10 min-w-0 flex-1 rounded-full border border-border bg-muted px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
});

export interface MobileSearchViewProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCancel?: boolean;
}

export function MobileSearchView({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className,
  showCancel = true,
}: MobileSearchViewProps) {
  const { messages } = useKoiContext();
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const [active, setActive] = useState(false);
  const resolvedPlaceholder = placeholder ?? messages.searchPlaceholder;

  const submit = () => onSearch?.(internal);

  return (
    <div className={cn(mobileSearchVariants(), className)}>
      <input
        type="search"
        className={mobileInputVariants()}
        value={internal}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        onFocus={() => setActive(true)}
        onChange={(e) => setInternal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      {showCancel && active ? (
        <button
          type="button"
          className="shrink-0 text-sm text-primary"
          onClick={() => {
            setInternal('');
            setActive(false);
            onSearch?.('');
          }}
        >
          {messages.cancelActionText}
        </button>
      ) : (
        <button
          type="button"
          className="shrink-0 text-sm text-primary"
          disabled={disabled}
          onClick={submit}
        >
          {messages.searchActionText}
        </button>
      )}
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
