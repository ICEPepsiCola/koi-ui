import { useEffect, useMemo, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { ClearButton } from '../shared/ClearButton';
import type { CascaderOption } from './Cascader';

export interface CascaderDropdownViewProps {
  options: CascaderOption[];
  value?: string[];
  onChange?: (value: string[], labels: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

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

export function CascaderDropdownView({
  options,
  value = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = false,
}: CascaderDropdownViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[]>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const labels = useMemo(
    () => getOptionPath(options, value),
    [options, value],
  );
  const showClear = clearable && !disabled && value.length > 0;

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
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span className={labels.length ? '' : 'text-muted-foreground'}>
          {labels.length ? labels.join(' / ') : placeholder}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {showClear ? (
            <ClearButton
              label={messages.clearActionText}
              onClear={() => {
                onChange?.([], []);
                setOpen(false);
                setActivePath([]);
              }}
            />
          ) : null}
          <span>▾</span>
        </span>
      </div>
      {open ? (
        <div className="absolute z-10 mt-1 flex rounded-md border border-border bg-surface shadow-md">
          {columns.map((col, level) => (
            <ul
              key={level}
              className="max-h-60 min-w-32 overflow-auto border-r border-border py-1 last:border-r-0"
            >
              {col.map((opt) => (
                <li
                  key={opt.value}
                  className={cn(
                    'cursor-pointer px-3 py-2 text-sm hover:bg-muted',
                    activePath[level] === opt.value && 'bg-muted font-medium',
                    opt.disabled && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={() => selectAtLevel(level, opt)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : null}
    </div>
  );
}
