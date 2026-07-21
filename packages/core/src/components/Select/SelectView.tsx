import { useId, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { cn } from '../../utils/cn';
import { findEnabledIndex, findNextEnabledIndex } from '../../utils/keyboard';
import { ClearButton } from '../shared/ClearButton';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectViewProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function SelectView({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  clearable = false,
}: SelectViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      options.findIndex((option) => option.value === value && !option.disabled),
      findEnabledIndex(options),
    ),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((o) => o.value === value);
  const resolvedPlaceholder = placeholder ?? messages.selectPlaceholder;
  const showClear = clearable && !disabled && value !== undefined && value !== '';

  useDismissibleLayer({
    open,
    onDismiss: () => setOpen(false),
    containerRef,
    closeOnPointerDownOutside: true,
  });

  const commitValue = (nextValue: string) => {
    onChange?.(nextValue);
    setOpen(false);
  };

  const openListbox = () => {
    setOpen(true);
    const selectedIndex = options.findIndex(
      (option) => option.value === value && !option.disabled,
    );
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : Math.max(findEnabledIndex(options), 0),
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => {
          if (disabled) return;
          if (open) {
            setOpen(false);
            return;
          }
          openListbox();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
              openListbox();
              return;
            }
            setActiveIndex((current) =>
              findNextEnabledIndex(
                options,
                current < 0 ? 0 : current,
                event.key === 'ArrowDown' ? 1 : -1,
              ),
            );
            return;
          }
          if (event.key === 'Home') {
            event.preventDefault();
            setActiveIndex(Math.max(findEnabledIndex(options), 0));
            if (!open) openListbox();
            return;
          }
          if (event.key === 'End') {
            event.preventDefault();
            const reversedIndex = [...options]
              .reverse()
              .findIndex((option) => !option.disabled);
            const nextIndex =
              reversedIndex >= 0 ? options.length - reversedIndex - 1 : -1;
            if (nextIndex >= 0) setActiveIndex(nextIndex);
            if (!open) openListbox();
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!open) {
              openListbox();
              return;
            }
            const activeOption = options[activeIndex];
            if (activeOption && !activeOption.disabled) {
              commitValue(activeOption.value);
            }
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected?.label ?? resolvedPlaceholder}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {showClear ? (
            <ClearButton
              label={messages.clearActionText}
              onClear={() => {
                onChange?.('');
                setOpen(false);
              }}
            />
          ) : null}
          <span>▾</span>
        </span>
      </div>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-md"
        >
          {options.map((opt, index) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={cn(
                'px-3 py-2 text-sm',
                opt.disabled && 'cursor-not-allowed opacity-50',
                !opt.disabled && 'cursor-pointer hover:bg-muted',
                (opt.value === value || index === activeIndex) && 'bg-muted font-medium',
              )}
              onMouseEnter={() => {
                if (!opt.disabled) setActiveIndex(index);
              }}
              onClick={() => {
                if (opt.disabled) return;
                commitValue(opt.value);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
