import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Portal } from '../../utils/portal';
import { Overlay } from '../shared/Overlay';
import { Spinner } from '../shared/Spinner';

export interface LoadingProps {
  open?: boolean;
  tip?: ReactNode;
  fullscreen?: boolean;
  className?: string;
}

export function Loading({
  open = true,
  tip,
  fullscreen = true,
  className,
}: LoadingProps) {
  if (!open) return null;

  const content = (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg bg-surface px-6 py-4 shadow-md',
        className,
      )}
    >
      <Spinner className="h-8 w-8" />
      {tip ? <span className="text-sm text-muted-foreground">{tip}</span> : null}
    </div>
  );

  if (!fullscreen) return content;

  return (
    <Portal>
      <Overlay open className="flex items-center justify-center">
        {content}
      </Overlay>
    </Portal>
  );
}
