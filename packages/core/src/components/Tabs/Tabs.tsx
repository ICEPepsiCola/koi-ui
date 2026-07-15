import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { findEnabledIndex, findNextEnabledIndex } from '../../utils/keyboard';

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
    defaultActiveKey ?? items[findEnabledIndex(items)]?.key ?? items[0]?.key ?? '',
  );
  const activeKey = controlledKey ?? internalKey;
  const activeItem = items.find((item) => item.key === activeKey);
  const tabsId = useId();
  const activeIndex = Math.max(
    items.findIndex((item) => item.key === activeKey),
    0,
  );
  const ids = useMemo(
    () =>
      items.map((item, index) => ({
        tabId: `${tabsId}-tab-${item.key || index}`,
        panelId: `${tabsId}-panel-${item.key || index}`,
      })),
    [items, tabsId],
  );

  const handleChange = (key: string) => {
    if (controlledKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      handleChange(items[findNextEnabledIndex(items, index, 1)]!.key);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      handleChange(items[findNextEnabledIndex(items, index, -1)]!.key);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      const nextIndex = findEnabledIndex(items);
      if (nextIndex >= 0) handleChange(items[nextIndex]!.key);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const reversedIndex = [...items].reverse().findIndex((item) => !item.disabled);
      if (reversedIndex >= 0) {
        handleChange(items[items.length - reversedIndex - 1]!.key);
      }
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border"
        role="tablist"
      >
        {items.map((item, index) => (
          <button
            key={item.key}
            id={ids[index]!.tabId}
            type="button"
            role="tab"
            aria-selected={item.key === activeKey}
            aria-controls={ids[index]!.panelId}
            tabIndex={index === activeIndex ? 0 : -1}
            disabled={item.disabled}
            className={cn(
              'shrink-0 px-4 py-2 text-sm font-medium transition-colors',
              item.key === activeKey
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-surface-foreground',
              item.disabled && 'cursor-not-allowed opacity-50',
            )}
            onClick={() => !item.disabled && handleChange(item.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id={ids[activeIndex]?.panelId}
        className="py-4"
        role="tabpanel"
        aria-labelledby={ids[activeIndex]?.tabId}
      >
        {activeItem?.children}
      </div>
    </div>
  );
}
