import type { HTMLAttributes, ReactNode } from 'react';
import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  description?: ReactNode;
  image?: ReactNode;
  children?: ReactNode;
}

export function Empty({
  className,
  description,
  image,
  children,
  ...props
}: EmptyProps) {
  const { messages } = useKoiContext();

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
      <p className="text-sm text-muted-foreground">
        {description ?? messages.emptyText}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
