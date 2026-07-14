import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  className,
}: TabsProps) {
  const [internalKey, setInternalKey] = useState(
    defaultActiveKey ?? items[0]?.key ?? '',
  );
  const activeKey = controlledKey ?? internalKey;
  const activeItem = items.find((item) => item.key === activeKey);

  const handleChange = (key: string) => {
    if (controlledKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border"
        role="tablist"
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === activeKey}
            disabled={item.disabled}
            className={cn(
              'shrink-0 px-4 py-2 text-sm font-medium transition-colors',
              item.key === activeKey
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-surface-foreground',
              item.disabled && 'cursor-not-allowed opacity-50',
            )}
            onClick={() => !item.disabled && handleChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="py-4" role="tabpanel">
        {activeItem?.children}
      </div>
    </div>
  );
}
