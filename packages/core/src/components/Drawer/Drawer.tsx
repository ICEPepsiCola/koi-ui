import { useId, useRef, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../utils/cn';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { Portal } from '../../utils/portal';
import { ModalBoxContent } from '../Modal/modalStyles';
import { MotionPanel } from '../shared/MotionPanel';
import { Overlay } from '../shared/Overlay';

const drawerVariants = tv({
  base: cn(
    'relative flex flex-col overflow-hidden bg-surface text-surface-foreground',
    'shadow-[0_25px_50px_-12px_rgb(0_0_0_/_0.25)]',
  ),
  variants: {
    placement: {
      left: 'h-full rounded-r-box rounded-l-none',
      right: 'h-full rounded-l-box rounded-r-none',
      top: 'w-full rounded-b-box rounded-t-none',
      bottom: 'w-full rounded-t-box rounded-b-none',
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

const overlayClass = {
  left: 'grid h-full place-items-stretch justify-items-start',
  right: 'grid h-full place-items-stretch justify-items-end',
  top: 'grid h-full place-items-start',
  bottom: 'grid h-full place-items-end',
} as const;

export interface DrawerProps extends VariantProps<typeof drawerVariants> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * @default true
   */
  maskClosable?: boolean;
  /**
   * @default false
   */
  closable?: boolean;
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
  closable = false,
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const resolvedPlacement = placement ?? 'right';
  const resolvedSize = size ?? 'md';

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

  const sizeClass = sizeMap[resolvedPlacement][resolvedSize];

  return (
    <Portal>
      <Overlay
        open={open}
        onClick={maskClosable ? onClose : undefined}
        className={overlayClass[resolvedPlacement]}
      >
        <MotionPanel
          ref={drawerRef}
          variant={resolvedPlacement}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            drawerVariants({
              placement: resolvedPlacement,
              size: resolvedSize,
            }),
            sizeClass,
            'p-6',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalBoxContent
            title={title}
            footer={footer}
            closable={closable}
            onClose={onClose}
            titleId={titleId}
            descriptionId={descriptionId}
            headerExtra={
              resolvedPlacement === 'bottom' ? (
                <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border" />
              ) : null
            }
          >
            {children}
          </ModalBoxContent>
        </MotionPanel>
      </Overlay>
    </Portal>
  );
}
