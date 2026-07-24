import {
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { controlTransition, focusRing, pressable } from '../../utils/interaction';
import { findEnabledIndex, findNextEnabledIndex } from '../../utils/keyboard';

const tabBarVariants = tv({
  base: 'z-40 flex w-full bg-surface',
  variants: {
    safeArea: {
      true: 'pb-[env(safe-area-inset-bottom)]',
      false: '',
    },
    bordered: {
      true: 'border border-border',
      false: 'border-0',
    },
    fixed: {
      true: 'fixed inset-x-0 bottom-0',
      false: 'relative rounded-box',
    },
  },
  defaultVariants: {
    safeArea: true,
    bordered: true,
    fixed: true,
  },
});

const tabItemVariants = tv({
  base: cn(
    'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-xs',
    controlTransition,
    focusRing,
    pressable,
  ),
  variants: {
    active: {
      true: 'text-primary',
      false: 'text-muted-foreground',
    },
    disabled: {
      true: 'pointer-events-none opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
    disabled: false,
  },
});

export interface TabBarItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'>,
    VariantProps<typeof tabBarVariants> {
  items: TabBarItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  /**
   * Pin to the viewport bottom.
   * Docs preview (`KoiProvider.previewDevice`) defaults to `false` so it stays in the demo frame.
   * @since 1.12.0
   */
  fixed?: boolean;
  /**
   * Show border around the bar.
   * @default true
   * @since 1.12.0
   */
  bordered?: boolean;
}

export function TabBar({
  items,
  activeKey: controlledKey,
  defaultActiveKey,
  onChange,
  safeArea,
  fixed,
  bordered,
  className,
  ...props
}: TabBarProps) {
  const { previewDevice } = useKoiContext();
  const isFixed = fixed ?? previewDevice == null;

  const [internalKey, setInternalKey] = useState(
    defaultActiveKey ??
      items[findEnabledIndex(items)]?.key ??
      items[0]?.key ??
      '',
  );
  const activeKey = controlledKey ?? internalKey;
  const activeIndex = Math.max(
    items.findIndex((item) => item.key === activeKey),
    0,
  );

  const handleChange = (key: string) => {
    if (controlledKey === undefined) setInternalKey(key);
    onChange?.(key);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
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
      const reversedIndex = [...items]
        .reverse()
        .findIndex((item) => !item.disabled);
      if (reversedIndex >= 0) {
        handleChange(items[items.length - reversedIndex - 1]!.key);
      }
    }
  };

  return (
    <nav
      className={cn(
        tabBarVariants({ safeArea, bordered, fixed: isFixed }),
        className,
      )}
      role="tablist"
      {...props}
    >
      {items.map((item, index) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={item.key === activeKey}
          tabIndex={index === activeIndex ? 0 : -1}
          disabled={item.disabled}
          className={cn(
            tabItemVariants({
              active: item.key === activeKey,
              disabled: item.disabled,
            }),
          )}
          onClick={() => !item.disabled && handleChange(item.key)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {item.icon || item.badge ? (
            <span className="relative inline-flex shrink-0 items-center justify-center">
              {item.icon}
              {item.badge ? (
                <span className="pointer-events-none absolute right-0 top-0 z-10 flex h-4 min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-error px-1 text-[10px] leading-none text-error-foreground">
                  {item.badge}
                </span>
              ) : null}
            </span>
          ) : null}
          <span className="leading-none">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
