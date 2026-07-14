import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface SafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  position?: 'top' | 'bottom' | 'both';
  children?: ReactNode;
}

export function SafeArea({
  className,
  style,
  position = 'both',
  children,
  ...props
}: SafeAreaProps) {
  const insetStyle: CSSProperties = {
    ...style,
    paddingTop:
      position === 'top' || position === 'both'
        ? 'max(env(safe-area-inset-top, 0px), var(--koi-safe-area-top, 0px))'
        : style?.paddingTop,
    paddingBottom:
      position === 'bottom' || position === 'both'
        ? 'max(env(safe-area-inset-bottom, 0px), var(--koi-safe-area-bottom, 0px))'
        : style?.paddingBottom,
  };

  return (
    <div
      className={cn(
        position === 'top' || position === 'both' ? 'pt-safe' : '',
        position === 'bottom' || position === 'both' ? 'pb-safe' : '',
        className,
      )}
      style={insetStyle}
      {...props}
    >
      {children}
    </div>
  );
}
