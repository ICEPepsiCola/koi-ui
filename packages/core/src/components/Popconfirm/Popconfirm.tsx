import { useState, type ReactNode } from 'react';
import {
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from '@koi-ui/icons';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { Button } from '../Button';
import { Popover } from '../Popover';

export interface PopconfirmProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  okType?: 'primary' | 'error';
  disabled?: boolean;
  /**
   * @default 'bottom'
   * @since 1.12.0
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function Popconfirm({
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText,
  okType = 'primary',
  disabled,
  placement = 'bottom',
}: PopconfirmProps) {
  const { messages } = useKoiContext();
  const [open, setOpen] = useState(false);
  const resolvedCancelText = cancelText ?? messages.cancelActionText;
  const isDanger = okType === 'error';

  if (disabled) return <>{children}</>;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement={placement}
      className="rounded-box border-border/70 p-3.5 shadow-overlay"
      content={
        <div className="flex w-[17.5rem] max-w-[min(17.5rem,calc(100vw-2rem))] flex-col gap-3.5">
          <div className="flex gap-3">
            <span
              className={cn(
                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                isDanger ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning',
              )}
              aria-hidden
            >
              {isDanger ? (
                <ExclamationTriangleIcon className="h-4 w-4" />
              ) : (
                <QuestionMarkCircleIcon className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-sm font-semibold leading-snug text-surface-foreground">
                {title}
              </div>
              {description ? (
                <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              color="neutral"
              variant="soft"
              onClick={() => {
                setOpen(false);
                onCancel?.();
              }}
            >
              {resolvedCancelText}
            </Button>
            <Button
              size="sm"
              color={isDanger ? 'error' : 'primary'}
              onClick={() => {
                setOpen(false);
                onConfirm?.();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
