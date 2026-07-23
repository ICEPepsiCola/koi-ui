import { cn } from '../../utils/cn';
import { controlOnBg, controlText, type ControlColor } from '../../utils/controlColor';

export type SpinnerStyle = 'spinner' | 'dots' | 'ring' | 'bars';

export function Spinner({
  className,
  style = 'spinner',
  color = 'primary',
}: {
  className?: string;
  style?: SpinnerStyle;
  color?: ControlColor;
}) {
  if (style === 'dots') {
    return (
      <span className={cn('inline-flex items-center gap-1', className)} aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn('h-1.5 w-1.5 animate-bounce rounded-full', controlOnBg[color])}
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    );
  }

  if (style === 'bars') {
    return (
      <span className={cn('inline-flex h-4 items-end gap-0.5', className)} aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('w-0.5 animate-pulse rounded-full', controlOnBg[color])}
            style={{
              height: `${40 + i * 15}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </span>
    );
  }

  if (style === 'ring') {
    return (
      <span
        className={cn(
          'inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-current',
          controlText[color],
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        controlText[color],
        className,
      )}
      aria-hidden
    />
  );
}
