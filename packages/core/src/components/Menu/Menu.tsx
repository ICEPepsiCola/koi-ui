import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon/Icon';

const menuVariants = tv({
  base: 'flex bg-surface text-sm',
  variants: {
    mode: {
      vertical: 'w-full flex-col',
      horizontal: 'flex-row items-center gap-1',
      inline: 'inline-flex flex-row items-center gap-1',
    },
  },
  defaultVariants: {
    mode: 'vertical',
  },
});

const itemVariants = tv({
  base: 'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors',
  variants: {
    selected: {
      true: 'bg-muted font-medium text-primary',
      false: 'text-surface-foreground hover:bg-muted',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
    danger: {
      true: 'text-destructive hover:bg-destructive/10',
      false: '',
    },
  },
  defaultVariants: {
    selected: false,
    disabled: false,
    danger: false,
  },
});

export interface MenuItemType {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: MenuItemType[];
}

export interface MenuProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'>,
    VariantProps<typeof menuVariants> {
  items: MenuItemType[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onSelect?: (key: string) => void;
  onOpenChange?: (openKeys: string[]) => void;
}

function MenuItems({
  items,
  selectedKey,
  openKeys,
  mode,
  onSelect,
  onToggleOpen,
  depth = 0,
}: {
  items: MenuItemType[];
  selectedKey?: string;
  openKeys: string[];
  mode: 'vertical' | 'horizontal' | 'inline';
  onSelect?: (key: string) => void;
  onToggleOpen: (key: string) => void;
  depth?: number;
}) {
  return (
    <ul
      role="menu"
      className={cn(
        mode === 'vertical' ? 'flex w-full flex-col gap-0.5' : 'flex flex-row gap-0.5',
        depth > 0 && 'mt-1 flex flex-col gap-0.5 border-l border-border pl-2',
      )}
    >
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isOpen = openKeys.includes(item.key);
        const isSelected = selectedKey === item.key;

        return (
          <li key={item.key} role="none" className={mode === 'horizontal' ? 'relative' : ''}>
            <button
              type="button"
              role="menuitem"
              aria-expanded={hasChildren ? isOpen : undefined}
              disabled={item.disabled}
              className={cn(
                itemVariants({
                  selected: isSelected,
                  disabled: item.disabled,
                  danger: item.danger,
                }),
                mode === 'horizontal' && 'whitespace-nowrap',
                'w-full text-left',
              )}
              style={depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined}
              onClick={() => {
                if (item.disabled) return;
                if (hasChildren) {
                  onToggleOpen(item.key);
                } else {
                  onSelect?.(item.key);
                }
              }}
            >
              {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              <span className="flex-1">{item.label}</span>
              {hasChildren ? (
                <Icon
                  name={isOpen ? 'minus' : 'plus'}
                  size="xs"
                  className="text-muted-foreground"
                />
              ) : null}
            </button>
            {hasChildren && isOpen && mode !== 'horizontal' ? (
              <MenuItems
                items={item.children!}
                selectedKey={selectedKey}
                openKeys={openKeys}
                mode={mode}
                onSelect={onSelect}
                onToggleOpen={onToggleOpen}
                depth={depth + 1}
              />
            ) : null}
            {hasChildren && isOpen && mode === 'horizontal' ? (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-md border border-border bg-surface py-1 shadow-md">
                <MenuItems
                  items={item.children!}
                  selectedKey={selectedKey}
                  openKeys={openKeys}
                  mode="vertical"
                  onSelect={onSelect}
                  onToggleOpen={onToggleOpen}
                  depth={depth + 1}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function Menu({
  items,
  mode = 'vertical',
  selectedKey: controlledKey,
  defaultSelectedKey,
  openKeys: controlledOpenKeys,
  defaultOpenKeys = [],
  onSelect,
  onOpenChange,
  className,
  ...props
}: MenuProps) {
  const [internalKey, setInternalKey] = useState(defaultSelectedKey ?? '');
  const [internalOpenKeys, setInternalOpenKeys] = useState(defaultOpenKeys);

  const selectedKey = controlledKey ?? internalKey;
  const openKeys = controlledOpenKeys ?? internalOpenKeys;

  const handleSelect = (key: string) => {
    if (controlledKey === undefined) setInternalKey(key);
    onSelect?.(key);
  };

  const handleToggleOpen = (key: string) => {
    const next = openKeys.includes(key)
      ? openKeys.filter((k) => k !== key)
      : [...openKeys, key];
    if (controlledOpenKeys === undefined) setInternalOpenKeys(next);
    onOpenChange?.(next);
  };

  return (
    <nav className={cn(menuVariants({ mode }), className)} {...props}>
      <MenuItems
        items={items}
        selectedKey={selectedKey}
        openKeys={openKeys}
        mode={mode ?? 'vertical'}
        onSelect={handleSelect}
        onToggleOpen={handleToggleOpen}
      />
    </nav>
  );
}
