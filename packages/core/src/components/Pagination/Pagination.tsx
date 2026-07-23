import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';

export interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  current,
  total,
  pageSize = 10,
  onChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      Math.abs(p - current) <= 1,
  );

  const withEllipsis: (number | 'ellipsis')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1]! > 1) {
      withEllipsis.push('ellipsis');
    }
    withEllipsis.push(p);
  });

  const joinBtn =
    'rounded-none border-y border-r border-border first:rounded-l-field first:border-l last:rounded-r-field shadow-none';

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center overflow-hidden rounded-field',
        className,
      )}
      role="navigation"
      aria-label="pagination"
    >
      <Button
        variant="outline"
        color="neutral"
        size="sm"
        responsiveSize={false}
        disabled={current <= 1}
        className={joinBtn}
        onClick={() => onChange?.(current - 1)}
      >
        ‹
      </Button>
      {withEllipsis.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`e-${i}`}
            className="inline-flex h-8 min-w-8 items-center justify-center border-y border-r border-border bg-surface px-2 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={p}
            color={p === current ? 'primary' : 'neutral'}
            variant={p === current ? 'solid' : 'outline'}
            size="sm"
            responsiveSize={false}
            className={cn(joinBtn, p === current && 'z-[1] border-primary')}
            onClick={() => onChange?.(p)}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        color="neutral"
        size="sm"
        responsiveSize={false}
        disabled={current >= totalPages}
        className={joinBtn}
        onClick={() => onChange?.(current + 1)}
      >
        ›
      </Button>
    </div>
  );
}
