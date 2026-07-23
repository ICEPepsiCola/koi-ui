import { cn } from '../../utils/cn';

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

  const items: Array<
    | { type: 'prev' }
    | { type: 'next' }
    | { type: 'ellipsis'; key: string }
    | { type: 'page'; page: number }
  > = [
    { type: 'prev' },
    ...withEllipsis.map((p, i) =>
      p === 'ellipsis'
        ? ({ type: 'ellipsis', key: `e-${i}` } as const)
        : ({ type: 'page', page: p } as const),
    ),
    { type: 'next' },
  ];

  return (
    <div
      className={cn('inline-flex items-stretch', className)}
      role="navigation"
      aria-label="pagination"
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const join = cn(
          'inline-flex h-8 min-w-8 shrink-0 items-center justify-center border border-border',
          'bg-surface px-2 text-sm text-surface-foreground',
          'transition-colors duration-fast ease-emphasized',
          'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-primary focus-visible:ring-offset-1',
          !isFirst && '-ml-px',
          isFirst && 'rounded-l-field',
          isLast && 'rounded-r-field',
        );

        if (item.type === 'prev') {
          return (
            <button
              key="prev"
              type="button"
              disabled={current <= 1}
              className={cn(
                join,
                'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface',
              )}
              onClick={() => onChange?.(current - 1)}
              aria-label="previous page"
            >
              ‹
            </button>
          );
        }

        if (item.type === 'next') {
          return (
            <button
              key="next"
              type="button"
              disabled={current >= totalPages}
              className={cn(
                join,
                'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface',
              )}
              onClick={() => onChange?.(current + 1)}
              aria-label="next page"
            >
              ›
            </button>
          );
        }

        if (item.type === 'ellipsis') {
          return (
            <span
              key={item.key}
              className={cn(join, 'cursor-default text-muted-foreground')}
              aria-hidden
            >
              …
            </span>
          );
        }

        const active = item.page === current;
        return (
          <button
            key={item.page}
            type="button"
            className={cn(
              join,
              active
                ? 'z-10 border-primary bg-primary text-primary-foreground hover:bg-primary'
                : 'hover:bg-muted',
            )}
            onClick={() => onChange?.(item.page)}
            aria-current={active ? 'page' : undefined}
            aria-label={`page ${item.page}`}
          >
            {item.page}
          </button>
        );
      })}
    </div>
  );
}
