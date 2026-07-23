import { useId, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { findEnabledIndex, findNextEnabledIndex } from '../../utils/keyboard';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { OptionRow } from '../shared/OptionRow';

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
  size?: FieldSize;
}

export function SelectView({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  clearable = false,
  size = 'md',
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
  const hasValue = value !== undefined && value !== '' && Boolean(selected);

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
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={selected?.label}
        placeholder={resolvedPlaceholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.('');
          setOpen(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
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
          if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
      />
      <FloatMenu
        open={open}
        className="max-h-60 overflow-auto rounded-box border-border/70 p-1.5 shadow-sm"
      >
        <ul id={listboxId} role="listbox" className="flex flex-col gap-0.5">
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className="list-none"
              >
                <OptionRow
                  selected={isSelected}
                  active={isActive}
                  disabled={opt.disabled}
                  className="w-full"
                  onMouseEnter={() => {
                    if (!opt.disabled) setActiveIndex(index);
                  }}
                  onClick={() => {
                    if (opt.disabled) return;
                    commitValue(opt.value);
                  }}
                >
                  {opt.label}
                </OptionRow>
              </li>
            );
          })}
        </ul>
      </FloatMenu>
    </div>
  );
}
