import { useEffect, useMemo, useRef, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { FloatMenu } from '../shared/FloatMenu';
import { OptionRow } from '../shared/OptionRow';
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
      <FloatMenu open={open} className="flex w-auto overflow-hidden p-0 py-0">
        {columns.map((col, level) => (
          <ul
            key={level}
            className="max-h-60 min-w-32 overflow-auto border-r border-border/70 p-1 last:border-r-0"
          >
            {col.map((opt) => (
              <li key={opt.value} className="list-none">
                <OptionRow
                  selected={activePath[level] === opt.value}
                  hasChildren={Boolean(opt.children?.length)}
                  disabled={opt.disabled}
                  className="w-full"
                  onClick={() => selectAtLevel(level, opt)}
                >
                  {opt.label}
                </OptionRow>
              </li>
            ))}
          </ul>
        ))}
      </FloatMenu>
    </div>
  );
}
