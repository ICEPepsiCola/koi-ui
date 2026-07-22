import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { controlTransition, pressable } from '../../utils/interaction';

export interface SheetChromeProps {
  title?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: ReactNode;
  confirmText?: ReactNode;
  /** Hide confirm (e.g. instant-select sheets). */
  showConfirm?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Bottom-sheet chrome: drag handle + cancel/title/confirm toolbar.
 */
export function SheetChrome({
  title,
  onCancel,
  onConfirm,
  cancelText = '取消',
  confirmText = '确定',
  showConfirm = true,
  children,
  className,
}: SheetChromeProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-border/80" />
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <button
          type="button"
          className={cn(
            'min-w-12 text-left text-sm text-muted-foreground',
            controlTransition,
            pressable,
            'hover:text-surface-foreground',
          )}
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <span className="truncate text-center text-sm font-semibold text-surface-foreground">
          {title}
        </span>
        {showConfirm ? (
          <button
            type="button"
            className={cn(
              'min-w-12 text-right text-sm font-medium text-primary',
              controlTransition,
              pressable,
              'hover:brightness-110',
            )}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        ) : (
          <span className="min-w-12" aria-hidden />
        )}
      </div>
      {children}
    </div>
  );
}
