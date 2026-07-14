import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  description?: ReactNode;
  image?: ReactNode;
  children?: ReactNode;
}

export function Empty({
  className,
  description = '暂无数据',
  image,
  children,
  ...props
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
      {...props}
    >
      {image ?? (
        <div className="mb-4 text-4xl text-muted-foreground" aria-hidden>
          ∅
        </div>
      )}
      <p className="text-sm text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
