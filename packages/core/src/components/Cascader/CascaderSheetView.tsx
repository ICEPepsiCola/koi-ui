import { useMemo, useState } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import type { FieldSize } from '../../utils/interaction';
import { FieldTrigger } from '../shared/FieldTrigger';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';
import { OptionRow } from '../shared/OptionRow';
import { SheetChrome } from '../shared/SheetChrome';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import type { CascaderOption } from './Cascader';

export interface CascaderSheetViewProps {
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

export function CascaderSheetView({
  options,
  value = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = false,
  size = 'md',
}: CascaderSheetViewProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string[]>(value);
  const labels = useMemo(() => getOptionPath(options, value), [options, value]);
  const hasValue = value.length > 0;

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

  const closeSheet = () => {
    setOpen(false);
    setPath([]);
  };

  const selectOption = (opt: CascaderOption) => {
    if (opt.disabled) return;
    const nextPath = [...path, opt.value];
    setPath(nextPath);
    if (!opt.children?.length) {
      onChange?.(nextPath, getOptionPath(options, nextPath));
      closeSheet();
    }
  };

  const breadcrumb = getOptionPath(options, path);

  return (
    <>
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
          closeSheet();
        }}
        onClick={() => !disabled && setOpen(true)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Portal>
        <Overlay open={open} onClick={closeSheet}>
          <div className="flex h-full items-end">
            <MotionPanel
              variant="bottom"
              className="max-h-[70vh] w-full overflow-hidden rounded-t-box border border-border/80 bg-surface shadow-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <SheetChrome
                title={placeholder}
                onCancel={closeSheet}
                cancelText={messages.cancelActionText}
                showConfirm={false}
              >
                {breadcrumb.length > 0 ? (
                  <div className="flex items-center gap-1 border-b border-border/80 px-4 py-2 text-sm text-muted-foreground">
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
                <div className="max-h-[50vh] overflow-y-auto px-2 pb-3 pt-1">
                  {(path.length === 0 ? options : currentOptions).map((opt) => (
                    <OptionRow
                      key={opt.value}
                      hasChildren={Boolean(opt.children?.length)}
                      disabled={opt.disabled}
                      className={cn('mb-0.5')}
                      onClick={() => selectOption(opt)}
                    >
                      {opt.label}
                    </OptionRow>
                  ))}
                </div>
              </SheetChrome>
            </MotionPanel>
          </div>
        </Overlay>
      </Portal>
    </>
  );
}
