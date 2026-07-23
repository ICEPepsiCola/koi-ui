import { useEffect, useMemo, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { controlTransition } from '../../utils/interaction';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { ChevronRightIcon } from '@koi-ui/icons';
import type { CascaderOption } from './Cascader';

export interface CascaderDropdownViewProps {
  options: CascaderOption[];
  value?: string[];
  onChange?: (value: string[], labels: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: FieldSize;
}

const EMPTY_VALUE: string[] = [];

function getOptionPath(options: CascaderOption[], values: string[]) {
  const labels: string[] = [];
  let current = options;
  for (const val of values) {
    const found = current.find((o) => o.value === val);
    if (!found) break;
    labels.push(found.label);
    current = found.children ?? [];
  }
  return labels;
}

/**
 * Desktop Cascader — daisyUI-style multi-level menu columns.
 */
export function CascaderDropdownView({
  options,
  value = EMPTY_VALUE,
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = false,
  size = 'md',
}: CascaderDropdownViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[]>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const labels = useMemo(
    () => getOptionPath(options, value),
    [options, value],
  );
  const hasValue = value.length > 0;

  const columns = useMemo(() => {
    const cols: CascaderOption[][] = [options];
    let current = options;
    for (const val of activePath) {
      const found = current.find((o) => o.value === val);
      if (!found?.children?.length) break;
      cols.push(found.children);
      current = found.children;
    }
    return cols;
  }, [options, activePath]);

  useEffect(() => {
    if (!open) return;
    setActivePath(value);
  }, [open, value]);

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

  const selectAtLevel = (level: number, opt: CascaderOption) => {
    if (opt.disabled) return;
    const nextPath = [...activePath.slice(0, level), opt.value];
    setActivePath(nextPath);
    if (!opt.children?.length) {
      onChange?.(nextPath, getOptionPath(options, nextPath));
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <FieldTrigger
        size={size}
        open={open}
        disabled={disabled}
        hasValue={hasValue}
        display={labels.join(' / ')}
        placeholder={placeholder}
        clearable={clearable}
        clearLabel={messages.clearActionText}
        onClear={() => {
          onChange?.([], []);
          setOpen(false);
          setActivePath([]);
        }}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
      />
      <FloatMenu
        open={open}
        className="flex w-auto overflow-hidden rounded-box border-border/70 p-0 shadow-sm"
      >
        {columns.map((col, level) => (
          <ul
            key={level}
            role="listbox"
            className="max-h-60 min-w-36 overflow-y-auto overscroll-contain border-r border-border/60 p-1.5 last:border-r-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {col.map((opt) => {
              const active = activePath[level] === opt.value;
              const hasChildren = Boolean(opt.children?.length);
              return (
                <li key={opt.value} className="list-none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={opt.disabled}
                    className={cn(
                      'flex h-9 w-full items-center gap-2 rounded-selector px-2.5 text-left text-sm',
                      controlTransition,
                      active
                        ? 'bg-primary/12 font-semibold text-primary'
                        : 'font-normal text-surface-foreground/80 hover:bg-muted/70',
                      opt.disabled &&
                        'cursor-not-allowed opacity-40 hover:bg-transparent',
                    )}
                    onClick={() => selectAtLevel(level, opt)}
                  >
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {hasChildren ? (
                      <ChevronRightIcon
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </FloatMenu>
    </div>
  );
}
