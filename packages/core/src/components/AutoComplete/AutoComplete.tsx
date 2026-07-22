import { useEffect, useMemo, useRef, useState } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { fieldBase } from '../../utils/interaction';
import { Text } from '../../primitives/Text';
import { useKoiContext } from '../../provider/context';
import { ClearButton } from '../shared/ClearButton';
import { FloatMenu } from '../shared/FloatMenu';
import { OptionRow } from '../shared/OptionRow';

const autoCompleteVariants = tv({
  base: cn(
    'w-full px-3 text-sm text-surface-foreground placeholder:text-muted-foreground',
    fieldBase,
  ),
  variants: {
    size: {
      sm: 'h-8',
      md: 'h-10',
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
  /** String shows message; boolean only styles the border (Form.Item owns copy). */
  error?: string | boolean;
  className?: string;
  filterOption?: (input: string, option: AutoCompleteOption) => boolean;
  clearable?: boolean;
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
  clearable = false,
}: AutoCompleteProps) {
  const { messages } = useKoiContext();
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

  const showClear = clearable && !disabled && internal.length > 0;
  const showSuggestions = open && filtered.length > 0;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <input
        type="text"
        className={cn(
          autoCompleteVariants({ size, error: Boolean(error) }),
          showClear && 'pr-10',
        )}
        value={internal}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setOpen(true)}
        onChange={(e) => {
          setInternal(e.target.value);
          setOpen(true);
        }}
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
      />
      {showClear ? (
        <ClearButton
          label={messages.clearActionText}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClear={() => {
            setInternal('');
            setOpen(false);
          }}
        />
      ) : null}
      <FloatMenu
        open={showSuggestions}
        className="max-h-60 overflow-auto p-1"
      >
        <ul role="listbox" className="flex flex-col gap-0.5">
          {filtered.map((opt) => (
            <li key={opt.value} role="option" className="list-none">
              <OptionRow
                selected={opt.label === internal}
                disabled={opt.disabled}
                className="w-full"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (opt.disabled) return;
                  setInternal(opt.label);
                  onSelect?.(opt);
                  setOpen(false);
                }}
              >
                {opt.label}
              </OptionRow>
            </li>
          ))}
        </ul>
      </FloatMenu>
      {typeof error === 'string' ? (
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
