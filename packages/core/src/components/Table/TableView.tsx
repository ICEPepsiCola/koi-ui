import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useKoiContext } from '../../provider/context';
import { isActivationKey } from '../../utils/keyboard';
import { LoadingHint } from '../shared/LoadingHint';
import { Empty } from '../Empty/Empty';
export interface ColumnDef<T> {
  key: keyof T & string;
  title: ReactNode;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface TableViewProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export function TableView<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText,
  onRowClick,
}: TableViewProps<T>) {
  const { messages } = useKoiContext();
  const resolvedEmptyText = emptyText ?? messages.emptyText;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (!onRowClick || !isActivationKey(event.key)) return;
    event.preventDefault();
    onRowClick(row);
  };

  if (loading) {
    return <LoadingHint />;
  }

  if (data.length === 0) {
    return <Empty description={resolvedEmptyText} className="py-8" />;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-medium text-surface-foreground"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-t border-border',
                onRowClick && 'cursor-pointer hover:bg-muted/50 focus-within:bg-muted/50',
              )}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(event) => handleRowKeyDown(event, row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
