import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';
import { Overlay, type OverlayProps } from '../shared/Overlay';

export interface MaskProps extends OverlayProps {
  visible?: boolean;
  children?: ReactNode;
  zIndex?: number;
}

export function Mask({
  visible = true,
  open,
  children,
  className,
  zIndex = 50,
  ...props
}: MaskProps) {
  const isOpen = open ?? visible;

  const mask = (
    <Overlay
      open={isOpen}
      className={cn(className)}
      style={{ zIndex }}
      {...props}
    >
      {children}
    </Overlay>
  );

  return <Portal>{mask}</Portal>;
}
