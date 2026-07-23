import { useState, type ReactNode } from 'react';
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
}

export function Popconfirm({
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  okType = 'primary',
  disabled,
}: PopconfirmProps) {
  const [open, setOpen] = useState(false);

  if (disabled) return <>{children}</>;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      content={
        <div className="w-56">
          <div className="mb-1 text-sm font-medium">{title}</div>
          {description ? (
            <div className="mb-3 text-xs text-muted-foreground">
              {description}
            </div>
          ) : null}
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
              {cancelText}
            </Button>
            <Button
              size="sm"
              color={okType === 'error' ? 'error' : 'primary'}
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
