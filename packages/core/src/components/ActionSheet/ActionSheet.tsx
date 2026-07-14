import { useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';

export interface ActionSheetAction {
  key: string;
  text: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}

export interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  actions: ActionSheetAction[];
  cancelText?: ReactNode;
  closeOnAction?: boolean;
}

export function ActionSheet({
  open,
  onClose,
  title,
  description,
  actions,
  cancelText = '取消',
  closeOnAction = true,
}: ActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  if (!open) return null;

  return (
    <Portal>
      <Overlay open onClick={onClose}>
        <div className="flex h-full items-end">
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            className="w-full rounded-t-xl bg-surface pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {title || description ? (
              <div className="border-b border-border px-4 py-3 text-center">
                {title ? (
                  <div className="text-sm font-medium">{title}</div>
                ) : null}
                {description ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="divide-y divide-border">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  disabled={action.disabled}
                  className={cn(
                    'w-full px-4 py-3.5 text-center text-base',
                    action.destructive && 'text-destructive',
                    action.disabled && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={() => {
                    action.onClick?.();
                    if (closeOnAction) onClose();
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full border-t border-border px-4 py-3.5 text-center text-base font-medium"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </Overlay>
    </Portal>
  );
}
