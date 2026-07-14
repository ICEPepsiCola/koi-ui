import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { useScrollLock } from '../../hooks/useScrollLock';
import type { CascaderOption } from './Cascader';

export interface CascaderSheetViewProps {
  options: CascaderOption[];
  value?: string[];
  onChange?: (value: string[], labels: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
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

export function CascaderSheetView({
  options,
  value = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
}: CascaderSheetViewProps) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string[]>(value);
  const labels = useMemo(() => getOptionPath(options, value), [options, value]);

  const currentOptions = useMemo(() => {
    let current = options;
    for (const val of path) {
      const found = current.find((o) => o.value === val);
      if (!found?.children) return [];
      current = found.children;
    }
    return current;
  }, [options, path]);

  useScrollLock(open);

  const selectOption = (opt: CascaderOption) => {
    if (opt.disabled) return;
    const nextPath = [...path, opt.value];
    setPath(nextPath);
    if (!opt.children?.length) {
      onChange?.(nextPath, getOptionPath(options, nextPath));
      setOpen(false);
      setPath([]);
    }
  };

  const breadcrumb = getOptionPath(options, path);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setOpen(true)}
      >
        <span className={labels.length ? '' : 'text-muted-foreground'}>
          {labels.length ? labels.join(' / ') : placeholder}
        </span>
        <span className="text-muted-foreground">▾</span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-overlay"
          onClick={() => {
            setOpen(false);
            setPath([]);
          }}
        >
          <div
            className="max-h-[70vh] w-full overflow-y-auto rounded-t-lg bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-4 py-3 text-center font-medium">
              {placeholder}
            </div>
            {breadcrumb.length > 0 ? (
              <div className="flex items-center gap-1 border-b border-border px-4 py-2 text-sm text-muted-foreground">
                <button type="button" onClick={() => setPath([])}>
                  全部
                </button>
                {breadcrumb.map((label, idx) => (
                  <span key={`${label}-${idx}`}>
                    {' / '}
                    <button
                      type="button"
                      onClick={() => setPath(path.slice(0, idx + 1))}
                    >
                      {label}
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            {(path.length === 0 ? options : currentOptions).map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted',
                  opt.disabled && 'cursor-not-allowed opacity-50',
                )}
                onClick={() => selectOption(opt)}
              >
                <span>{opt.label}</span>
                {opt.children?.length ? <span className="text-muted-foreground">›</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
