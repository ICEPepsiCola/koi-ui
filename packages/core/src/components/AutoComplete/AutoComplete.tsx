import { useEffect, useMemo, useRef, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';

const autoCompleteVariants = tv({
  base: 'w-full rounded-md border border-border bg-surface px-3 text-sm text-surface-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8',
      md: 'h-10',
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

export interface AutoCompleteOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface AutoCompleteProps {
  options: AutoCompleteOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: AutoCompleteOption) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  className?: string;
  filterOption?: (input: string, option: AutoCompleteOption) => boolean;
}

export function AutoComplete({
  options,
  value,
  defaultValue = '',
  onChange,
  onSelect,
  placeholder = '请输入',
  disabled = false,
  size = 'md',
  error,
  className,
  filterOption,
}: AutoCompleteProps) {
  const [internal, setInternal] = useControlled(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const matcher =
      filterOption ??
      ((input: string, option: AutoCompleteOption) =>
        option.label.toLowerCase().includes(input.toLowerCase()) ||
        option.value.toLowerCase().includes(input.toLowerCase()));
    if (!internal) return options;
    return options.filter((opt) => matcher(internal, opt));
  }, [options, internal, filterOption]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <input
        type="text"
        className={autoCompleteVariants({ size, error: Boolean(error) })}
        value={internal}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setOpen(true)}
        onChange={(e) => {
          setInternal(e.target.value);
          setOpen(true);
        }}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && filtered.length > 0 ? (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-md"
        >
          {filtered.map((opt) => (
            <li
              key={opt.value}
              role="option"
              className={cn(
                'cursor-pointer px-3 py-2 text-sm hover:bg-muted',
                opt.disabled && 'cursor-not-allowed opacity-50',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (opt.disabled) return;
                setInternal(opt.label);
                onSelect?.(opt);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <Text size="sm" className="mt-1 text-destructive">
          {error}
        </Text>
      ) : null}
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
