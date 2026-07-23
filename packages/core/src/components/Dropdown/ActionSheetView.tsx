import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { ActionSheet } from '../ActionSheet';
import type { DropdownItem } from './DropdownView';

export interface ActionSheetViewProps {
  trigger: ReactNode;
  items: DropdownItem[];
  title?: ReactNode;
  disabled?: boolean;
  onSelect?: (key: string) => void;
}

/** Dropdown 移动端：复用 ActionSheet */
export function ActionSheetView({
  trigger,
  items,
  title,
  disabled = false,
  onSelect,
}: ActionSheetViewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => !disabled && setOpen(true)}
        className={cn(disabled && 'pointer-events-none opacity-50')}
      >
        {trigger}
      </div>
      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        actions={items.map((item) => ({
          key: item.key,
          text: item.label,
          disabled: item.disabled,
          color: item.color,
          onClick: () => {
            item.onClick?.();
            onSelect?.(item.key);
          },
        }))}
      />
    </>
  );
}
