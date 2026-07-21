import type { MouseEvent } from 'react';
import { XCircleIcon } from '@koi-ui/icons';
import { cn } from '../../utils/cn';

export interface ClearButtonProps {
  label: string;
  onClear: () => void;
  className?: string;
}

export function ClearButton({ label, onClear, className }: ClearButtonProps) {
  const stopTrigger = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onMouseDown={stopTrigger}
      onClick={(event) => {
        stopTrigger(event);
        onClear();
      }}
    >
      <XCircleIcon className="h-4 w-4" />
    </button>
  );
}
