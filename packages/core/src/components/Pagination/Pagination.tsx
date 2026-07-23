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

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-1',
        className,
      )}
    >
      <Button
        variant="ghost"
        color="neutral"
        size="sm"
        responsiveSize={false}
        disabled={current <= 1}
        onClick={() => onChange?.(current - 1)}
      >
        上一页
      </Button>
      {withEllipsis.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={p}
            color={p === current ? 'primary' : 'neutral'}
            variant={p === current ? 'solid' : 'ghost'}
            size="sm"
            responsiveSize={false}
            onClick={() => onChange?.(p)}
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        color="neutral"
        size="sm"
        responsiveSize={false}
        disabled={current >= totalPages}
        onClick={() => onChange?.(current + 1)}
      >
        下一页
      </Button>
    </div>
  );
}
