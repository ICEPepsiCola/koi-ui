import { useId, useRef, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';

const drawerVariants = tv({
  base: 'fixed z-50 flex flex-col border border-border bg-surface shadow-md transition-transform',
  variants: {
    placement: {
      left: 'left-0 top-0 h-full',
      right: 'right-0 top-0 h-full',
      top: 'left-0 top-0 w-full',
      bottom: 'bottom-0 left-0 w-full rounded-t-lg',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    placement: 'right',
    size: 'md',
  },
});

const sizeMap = {
  left: { sm: 'w-64', md: 'w-80', lg: 'w-96' },
  right: { sm: 'w-64', md: 'w-80', lg: 'w-96' },
  top: { sm: 'h-48', md: 'h-64', lg: 'h-80' },
  bottom: { sm: 'h-48', md: 'max-h-[70vh]', lg: 'max-h-[90vh]' },
} as const;

export interface DrawerProps extends VariantProps<typeof drawerVariants> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  maskClosable?: boolean;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'right',
  size = 'md',
  maskClosable = true,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);
  useDismissibleLayer({
    open,
    onDismiss: onClose,
    containerRef: drawerRef,
  });
  useFocusTrap({
    active: open,
    containerRef: drawerRef,
  });

  if (!open) return null;

  const sizeClass = sizeMap[placement ?? 'right'][size ?? 'md'];

  return (
    <Portal>
      <Overlay open onClick={maskClosable ? onClose : undefined}>
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            drawerVariants({ placement, size }),
            sizeClass,
            placement === 'bottom' && 'items-end',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {placement === 'bottom' ? (
            <div className="mx-auto my-2 h-1 w-10 rounded-full bg-border" />
          ) : null}
          {title ? (
            <div
              id={titleId}
              className="border-b border-border px-4 py-3 text-lg font-semibold"
            >
              {title}
            </div>
          ) : null}
          <div id={descriptionId} className="flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>
          {footer ? (
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </Overlay>
    </Portal>
  );
}
