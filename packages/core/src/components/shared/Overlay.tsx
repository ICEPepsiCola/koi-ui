import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function Overlay({ open, onClick, className, children, ...props }: OverlayProps) {
  if (!open) return null;
  return (
    <div
      className={cn('fixed inset-0 z-50 bg-overlay', className)}
      role="presentation"
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
