import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { controlTransition, focusRing } from '../../utils/interaction';
import { findEnabledIndex, findNextEnabledIndex } from '../../utils/keyboard';

const tabsVariants = tv({
  slots: {
    list: 'flex gap-1 overflow-x-auto',
    tab: cn(
      'shrink-0 px-4 py-2 text-sm font-medium',
      controlTransition,
      focusRing,
    ),
    panel: 'py-4',
  },
  variants: {
    variant: {
      line: {
        list: 'border-b border-border',
        tab: '',
      },
      boxed: {
        list: 'rounded-box bg-muted p-1',
        tab: 'rounded-selector',
      },
      bordered: {
        list: 'rounded-box border border-border p-1',
        tab: 'rounded-selector',
      },
      lifted: {
        list: 'border-b border-border',
        tab: 'rounded-t-selector border border-transparent',
      },
    },
  },
  defaultVariants: {
    variant: 'line',
  },
});

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends VariantProps<typeof tabsVariants> {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  /** @default 'line' */
  variant?: 'line' | 'boxed' | 'bordered' | 'lifted';
}

export function Tabs({
  items,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  className,
  variant = 'line',
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
  const { list, tab, panel } = tabsVariants({ variant });

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

  const activeTabClass = (isActive: boolean) => {
    if (!isActive) {
      return 'text-muted-foreground hover:text-surface-foreground';
    }
    switch (variant) {
      case 'boxed':
      case 'bordered':
        return 'bg-surface text-primary shadow-field';
      case 'lifted':
        return 'relative z-[1] -mb-px border-border border-b-surface bg-surface text-primary';
      case 'line':
      default:
        return 'border-b-2 border-primary text-primary';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={list()} role="tablist">
        {items.map((item, index) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              id={ids[index]!.tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={ids[index]!.panelId}
              tabIndex={index === activeIndex ? 0 : -1}
              disabled={item.disabled}
              className={cn(
                tab(),
                activeTabClass(isActive),
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
              onClick={() => !item.disabled && handleChange(item.key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        id={ids[activeIndex]?.panelId}
        className={panel()}
        role="tabpanel"
        aria-labelledby={ids[activeIndex]?.tabId}
      >
        {activeItem?.children}
      </div>
    </div>
  );
}
