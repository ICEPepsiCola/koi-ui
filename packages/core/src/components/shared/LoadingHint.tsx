import { useKoiContext } from '../../provider/context';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export function LoadingHint({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const { messages } = useKoiContext();

  return (
    <div
      className={cn(
        'flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner className="text-primary" />
      <span>{label ?? messages.loadingText}</span>
    </div>
  );
}
