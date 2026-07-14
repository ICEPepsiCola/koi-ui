import type { HTMLAttributes, ReactNode } from 'react';
import { useKoiBreakpoint } from '../../hooks/useKoiBreakpoint';
import { cn } from '../../utils/cn';

export interface DescriptionItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  span?: number;
}

export interface DescriptionsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  items: DescriptionItem[];
  column?: number;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

export function Descriptions({
  className,
  title,
  items,
  column = 3,
  bordered = false,
  size = 'md',
  layout = 'horizontal',
  ...props
}: DescriptionsProps) {
  const { isMobile } = useKoiBreakpoint();
  const cols = isMobile ? 1 : column;
  const pad =
    size === 'sm' ? 'px-3 py-2' : size === 'lg' ? 'px-4 py-4' : 'px-3 py-3';

  return (
    <div className={cn('w-full', className)} {...props}>
      {title ? (
        <div className="mb-3 text-base font-semibold text-surface-foreground">
          {title}
        </div>
      ) : null}

      {bordered ? (
        <div
          className="overflow-hidden rounded-lg border border-border"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, index) => {
            const span = Math.min(item.span ?? 1, cols);
            let used = 0;
            for (let i = 0; i < index; i++) {
              used += Math.min(items[i]?.span ?? 1, cols);
            }
            const colStart = used % cols;
            const isLastCol = colStart + span >= cols;
            const isNewRow = index > 0 && colStart === 0;
            return (
              <div
                key={item.key}
                className={cn(
                  'grid border-border bg-surface',
                  layout === 'horizontal'
                    ? 'grid-cols-[minmax(5.5rem,32%)_1fr]'
                    : 'grid-cols-1',
                  isNewRow && 'border-t',
                  !isLastCol && 'border-r',
                )}
                style={{ gridColumn: `span ${span}` }}
              >
                <div
                  className={cn(
                    pad,
                    'bg-muted/60 text-sm text-muted-foreground',
                    layout === 'horizontal' && 'border-r border-border',
                    layout === 'vertical' && 'border-b border-border',
                  )}
                >
                  {item.label}
                </div>
                <div className={cn(pad, 'text-sm text-surface-foreground')}>
                  {item.children}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="grid gap-x-6 gap-y-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => {
            const span = Math.min(item.span ?? 1, cols);
            return (
              <div
                key={item.key}
                className={cn(
                  layout === 'horizontal'
                    ? 'flex gap-3 text-sm'
                    : 'flex flex-col gap-1 text-sm',
                )}
                style={{ gridColumn: `span ${span}` }}
              >
                <div
                  className={cn(
                    'shrink-0 text-muted-foreground',
                    layout === 'horizontal' && 'min-w-16',
                  )}
                >
                  {item.label}
                  {layout === 'horizontal' ? (
                    <span className="ml-0.5 text-muted-foreground/70">:</span>
                  ) : null}
                </div>
                <div className="min-w-0 text-surface-foreground">
                  {item.children}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
