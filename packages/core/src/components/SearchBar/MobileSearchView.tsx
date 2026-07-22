import { useState } from 'react';
import { MagnifyingGlassIcon } from '@koi-ui/icons';
import { tv } from 'tailwind-variants';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing } from '../../utils/interaction';
import { ClearButton } from '../shared/ClearButton';

const mobileSearchVariants = tv({
  base: 'flex w-full items-center gap-2',
});

const mobileInputVariants = tv({
  base: cn(
    'h-10 min-w-0 flex-1 rounded-full border border-border bg-muted px-4 text-sm outline-none shadow-field placeholder:text-muted-foreground',
    controlTransition,
    'hover:border-primary/35',
    focusRing,
    'disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
  ),
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
  clearable?: boolean;
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
  clearable = false,
}: MobileSearchViewProps) {
  const { messages } = useKoiContext();
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const [active, setActive] = useState(false);
  const resolvedPlaceholder = placeholder ?? messages.searchPlaceholder;
  const showClear = clearable && !disabled && internal.length > 0;

  const submit = () => onSearch?.(internal);

  return (
    <div className={cn(mobileSearchVariants(), className)}>
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          className={cn(mobileInputVariants(), 'pl-10', showClear && 'pr-10')}
          value={internal}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          onFocus={() => setActive(true)}
          onChange={(e) => setInternal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        {showClear ? (
          <ClearButton
            label={messages.clearActionText}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClear={() => setInternal('')}
          />
        ) : null}
      </div>
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
